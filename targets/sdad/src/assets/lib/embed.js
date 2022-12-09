class ZenooFormAppSupport {
  setAuthCookie = (value, expires) => {
    document.cookie = 'acuant-go-auth=' + (value || '') + (expires ? '; expires=' + expires : '') + '; path=/'
  }
  getAuthCookie = () => {
    const parts = `; ${document.cookie}`.split('; acuant-go-auth=')
    if (parts.length === 2)
      return parts
        .pop()
        .split(';')
        .shift()
  }
  eraseAuthCookie = () => {
    document.cookie = 'acuant-go-auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  }

  dumpAppData = () => {
    console.log('DUMP app data', this.appWindowData)
  }

  postMessage = (id, data = null) => {
    const target = document.querySelector('#acuant-go-embed').contentWindow
    target.postMessage({ id, ...data }, '*')
  }

  getReferrerUrl = () => {
    return window.location != window.parent.location ? document.referrer : document.location.href
  }

  processIncomeMessage = e => {
    if (!e?.data?.action) {
      return
    }
    switch (e.data.action) {
      case 'get-location': {
        this.postMessage(e.data.id, { data: this.getReferrerUrl() })
        break
      }
      case 'get-value': {
        this.postMessage(e.data.id, { data: this.appWindowData[e.data.name] })
        break
      }
      case 'set-value': {
        this.appWindowData[e.data.name] = e.data.data
        this.postMessage(e.data.id)
        break
      }
      case 'get-auth-cookie': {
        this.postMessage(e.data.id, { data: this.getAuthCookie() })
        break
      }
      case 'set-auth-cookie': {
        this.setAuthCookie(e.data.data.value, e.data.data.expires)
        this.postMessage(e.data.id)
        break
      }
      case 'erase-auth-cookie': {
        this.eraseAuthCookie()
        this.postMessage(e.data.id)
        break
      }
      case 'set-frame-height': {
        document.querySelector('#acuant-go-embed').style.height = `${e.data.height}px`
        this.postMessage(e.data.id)
        break
      }
      case 'get-localstorage-value': {
        let data = e.data.data.defaultValue
        try {
          data = window.localStorage.getItem(e.data.data.key)
        } catch (_e) {}
        this.postMessage(e.data.id, { data })
        break
      }
      case 'set-localstorage-value': {
        try {
          data = window.localStorage.setItem(e.data.data.key, JSON.stringify(e.data.data.value))
        } catch (_e) {}
        this.postMessage(e.data.id)
        break
      }
      case 'verify-library': {
        this.postMessage(e.data.id)
      }
      default: {
        this.postMessage(e.data.id, { error: 'action_not_implemented', action: e?.data?.action })
        break
      }
    }
  }

  constructor() {
    this.appWindowData = {}
    window.addEventListener('message', this.processIncomeMessage)
  }
}
window.zenooAppSupport = new ZenooFormAppSupport()
