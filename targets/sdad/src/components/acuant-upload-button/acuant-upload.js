const SCRIPTS = {
  SDK: 'AcuantJavascriptWebSdk.min.js',
  DOCUMENT: 'AcuantCamera.min.js',
  LIVENESS: 'AcuantPassiveLiveness.min.js',
  OPENCV: 'opencv.min.js',
}

const defaultOptions = {
  disableImagePrevalidation: false,
  scriptSrc: 'assets',
  // messages
  messages: {
    blurry: 'Image appears blurry. Please retry.',
    ensure: 'Ensure all texts are visible.',
    hasGlare: 'Image has glare. Please retry.',
    generalFail: "Image can't be cropped, try another image.",
  },
  textOptions: {
    NONE: 'ALIGN',
    SMALL_DOCUMENT: 'MOVE CLOSER',
    BIG_DOCUMENT: 'TOO CLOSE',
    GOOD_DOCUMENT: null,
    CAPTURING: 'CAPTURING',
    TAP_TO_CAPTURE: 'TAP TO CAPTURE',
  },
  faceTextOptions: {
    FACE_NOT_FOUND: 'FACE NOT FOUND',
    TOO_MANY_FACES: 'TOO MANY FACES',
    FACE_ANGLE_TOO_LARGE: 'FACE ANGLE TOO LARGE',
    PROBABILITY_TOO_SMALL: 'PROBABILITY TOO SMALL',
    FACE_TOO_SMALL: 'FACE TOO SMALL',
    FACE_CLOSE_TO_BORDER: 'TOO CLOSE TO THE FRAME',
  },
  // handlers
  onAccepted: null,
  onImageCaptured: null,
  onImageCropFailed: null,
  onImageCropped: null,
  onRejected: null,
}

class Utils {
  /**
   * Convert Base64 to File
   * @param dataUrl
   * @param filename
   */
  static base64toFile(dataUrl, filename = 'image.jpg') {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])

    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  /**
   * Converts image data to URL
   * @param imageData
   */
  static imageData2Url(imageData) {
    const w = imageData.width
    const h = imageData.height
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.putImageData(imageData, 0, 0) // synchronous
    return canvas.toDataURL()
  }

  static filterObject(a) {
    return Object.keys(a).reduce((acc, key) => {
      if (a[key] !== undefined) {
        acc[key] = a[key]
      }
      return acc
    }, {})
  }
}

return class AcuantUpload {
  constructor(name, type, helpers, options, credentials) {
    this.name = name
    this.type = type
    this.helpers = helpers
    this.credentials = credentials

    this.options = {
      ...defaultOptions,
      ...Utils.filterObject(options || {}),
    }

    // states
    this.cameraOpened = false
    this.livenessStatus = ''
    this.initialized = !!window.onAcuantSdkLoaded || !!this.getAcuantJavascriptWebSdk()
    this.initializing = false
    this.processing = false
    this.processed = false
    this.message = ''

    this.initialize()
  }

  /**
   * Main methods to be called
   */
  openCamera = () => {
    if (this.type === 'document') {
      this.captureDocument()
    } else {
      this.captureSelfie()
    }
  }

  /**
   * Internal SDK methods
   */
  captureDocument = () => {
    this.setMessage('')

    if (!this.getAcuantCameraUI()) {
      return
    }

    if (this.getAcuantCamera().isCameraSupported) {
      this.setCameraOpened(true)

      this.getAcuantCameraUI().start(
        {
          onCaptured: this.onDocumentCaptured,
          onCropped: this.onDocumentCropped,
        },
        this.onDocumentError,
        { text: this.options.textOptions },
      )
    } else {
      this.getAcuantCamera().startManualCapture(
        {
          onCaptured: this.onDocumentCaptured,
          onCropped: this.onDocumentCropped,
        },
        this.onDocumentError,
      )
    }
  }

  captureSelfie = () => {
    {
      this.setMessage('')
      this.getAcuantPassiveLiveness().start(
        {
          onDetection: text => {
            this.setLivenessStatus(text)
          },
          onOpened: () => {
            this.setCameraOpened(true)
          },
          onClosed: () => {
            this.helpers.setVisited()
            this.setCameraOpened(false)
            this.setLivenessStatus('')
          },
          onError: () => {
            this.setLivenessStatus('')
          },
          onPhotoTaken: () => {
            this.setLivenessStatus('')
          },
          onCaptured: async image => {
            this.setCameraOpened(false)

            this.helpers.setVisited()
            this.setProcessing(true)

            const imageFile = Utils.base64toFile(`data:image/jpg;base64,${image}`)
            const event = { target: { files: [imageFile] } }

            if (typeof this.options.onImageCropped === 'function') {
              this.options.onImageCropped({ imageFile })
            }

            this.handleChange(event)

            if (typeof this.options.onAccepted === 'function') {
              this.options.onAccepted()
            }

            this.setProcessing(false)
            this.setProcessed(true)

            this.setCameraOpened(false)
          },
        },
        this.options.faceTextOptions,
      )
    }
  }

  onDocumentCaptured = async response => {
    if (typeof this.options.onImageCaptured === 'function') {
      this.options.onImageCaptured({ imageFile: Utils.imageData2Url(response.data) })
    }

    // Document captured
    // This is not the final result of processed image
    // Show a loading screen until onCropped is called
    this.setProcessing(true)
    this.helpers.setVisited()
  }

  onDocumentCropped = async response => {
    if (!response) {
      // Cropping error
      // Restart capture
      this.captureDocument()
      this.setCameraOpened(false)
      this.setProcessing(false)
      this.setMessage(this.options.messages.generalFail)

      if (typeof this.options.onRejected === 'function') {
        this.options.onRejected()
      }

      if (typeof this.options.onImageCropFailed === 'function') {
        this.options.onImageCropFailed({ error: this.options.messages.generalFail })
      }

      return
    }

    if (!this.options.disableImagePrevalidation) {
      const blurry = response.sharpness < 50
      const hasGlare = response.glare < 50

      if (blurry) {
        this.setMessage(this.options.messages.blurry)
        this.setCameraOpened(false)
        this.setProcessing(false)

        if (typeof this.options.onRejected === 'function') {
          this.options.onRejected()
        }

        if (typeof this.options.onImageCropFailed === 'function') {
          this.options.onImageCropFailed({ error: this.options.messages.blurry })
        }

        return
      } else if (hasGlare) {
        this.setMessage(this.options.messages.hasGlare)
        this.setCameraOpened(false)
        this.setProcessing(false)

        if (typeof this.options.onRejected === 'function') {
          this.options.onRejected()
        }

        if (typeof this.options.onImageCropFailed === 'function') {
          this.optionsonImageCropFailed({ error: messageHasGlare })
        }

        return
      } else {
        this.setMessage(this.options.messages.ensure)
      }
    }

    const imageFile = Utils.base64toFile(response.image.data)
    const event = { target: { files: [imageFile] } }

    if (typeof this.options.onImageCropped === 'function') {
      this.options.onImageCropped({ imageFile })
    }

    this.handleChange(event)

    this.setProcessed(true)

    if (typeof this.options.onAccepted === 'function') {
      this.options.onAccepted()
    }
    this.setCameraOpened(false)
    this.setProcessing(false)
  }

  onDocumentError = (error, code) => {
    this.getAcuantCamera().isCameraSupported = false

    this.setCameraOpened(false)
    this.setProcessing(false)

    switch (code) {
      case this.getAcuantJavascriptWebSdk().SEQUENCE_BREAK_CODE:
        console.error('Camera failed due to iOS 15 bug. Start manual capture.')
        break
      case this.getAcuantJavascriptWebSdk().START_FAIL_CODE:
        console.error('Live Camera failed to open. Start manual capture.')
        break
      default:
        console.error('Unknown camera failure. Start manual capture.')
        break
    }
  }

  /**
   * State setters for yaml component
   * - its using page storage with prefixes to handle change from context
   */
  setCameraOpened(cameraOpened) {
    this.cameraOpened = cameraOpened
    this.helpers.storageSet(`instance-${this.name}-${this.type}.cameraOpened`, this.cameraOpened)
  }

  setLivenessStatus(livenessStatus) {
    this.livenessStatus = livenessStatus
    this.helpers.storageSet(`instance-${this.name}-${this.type}.livenessStatus`, this.livenessStatus)
  }

  setInitializing(initializing) {
    this.initializing = initializing
    this.helpers.storageSet(`instance-${this.name}-${this.type}.initializing`, this.initializing)
  }

  setInitialized(initialized) {
    this.initialized = initialized
    this.helpers.storageSet(`instance-${this.name}-${this.type}.initialized`, this.initialized)
  }

  setProcessing(processing) {
    this.processing = processing
    this.helpers.storageSet(`instance-${this.name}-${this.type}.processing`, this.processing)
  }

  setProcessed(processed) {
    this.processed = processed
    this.helpers.storageSet(`instance-${this.name}-${this.type}.processed`, this.processed)
  }

  setMessage(message) {
    this.message = message
    this.helpers.storageSet(`instance-${this.name}-${this.type}.message`, this.message)
  }

  /**
   * Scripts loader
   */
  loadConfig() {
    // ToDo: This is not needed anymore because the acuantConfig was setted before, we need to look where and why
    // const script = document.createElement('script')
    // script.innerHTML = `
    //   const acuantConfig = {
    //     path: "assets/",
    //     jpegQuality: 1.0
    //   };
    // `
    // document.head.appendChild(script)
  }

  loadScript(script, async = false) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script')

      s.src = `${this.options.scriptSrc}/${script}`
      s.async = async
      s.onload = resolve
      s.onerror = reject
      document.body.appendChild(s)
    })
  }

  initialize = async () => {
    if (this.initialized) {
      return
    }

    if (!window.onAcuantSdkLoaded) {
      this.loadConfig()
      window.onAcuantSdkLoaded = this.initializeSdk

      try {
        await Promise.all([
          this.loadScript(SCRIPTS.SDK),
          this.loadScript(SCRIPTS.DOCUMENT, true),
          this.loadScript(SCRIPTS.LIVENESS, true),
          this.loadScript(SCRIPTS.OPENCV, true),
        ])
      } catch (error) {
        console.error('Error loading Acuant Web SDK. Please make sure you put SDK lib files into `src/assets/lib` folder')
      }

      // Run SDK initialization manually since it's set to `DOMContentLoaded` event
      // and we are loding SDK scripts dynamically
      window.loadAcuantSdk()
      window.onAcuantSdkLoaded()
    } else {
      // Wait for initialization complete in case 2 inputs used on one page
      setTimeout(() => {
        this.setInitialized(true)
        this.getAcuantJavascriptWebSdk().start()
      }, 0)
    }
  }

  initializeSdk = () => {
    if (this.initialized || this.initializing) {
      return
    }

    this.setInitializing(true)

    this.getAcuantJavascriptWebSdk().setUnexpectedErrorCallback(error => console.error('Acuant SDK unexpected error:', error))

    this.getAcuantJavascriptWebSdk().initialize(this.credentials.token, this.credentials.url, {
      onSuccess: () => {
        this.getAcuantJavascriptWebSdk().startWorkers(() => {
          this.setInitializing(false)
          this.setInitialized(true)
        })
      },
      onFail: () => {
        this.setInitializing(false)
      },
    })
  }

  handleChange = async event => {
    const filesList = Array.from(event.target.files)
    const files = await Promise.all(filesList.map(file => this.helpers.getFileHolder(file)))
    this.helpers.changeValue(this.name, files)
    this.helpers.analyticsCustomEvent(`fields.${this.name}`, 'change')
  }

  getAcuantJavascriptWebSdk() {
    if (!window.AcuantJavascriptWebSdk) {
      window.AcuantJavascriptWebSdk = typeof AcuantJavascriptWebSdk !== 'undefined' ? AcuantJavascriptWebSdk : undefined
    }
    return window.AcuantJavascriptWebSdk
  }

  getAcuantCamera() {
    if (!window.AcuantCamera) {
      window.AcuantCamera = AcuantCamera
    }
    return window.AcuantCamera
  }

  getAcuantCameraUI() {
    if (!window.AcuantCameraUI) {
      window.AcuantCameraUI = AcuantCameraUI
    }
    return window.AcuantCameraUI
  }

  getAcuantPassiveLiveness() {
    if (!window.AcuantPassiveLiveness) {
      window.AcuantPassiveLiveness = AcuantPassiveLiveness
    }
    return window.AcuantPassiveLiveness
  }
}
