//
// Created by Sarath Soman on 23/09/2022.
//

#ifndef MATHSTRUCTURESC___ABSTRACTALGEBRAICSTRUCTURES_H
#define MATHSTRUCTURESC___ABSTRACTALGEBRAICSTRUCTURES_H

template <typename T, typename R>
class BinaryOperationWithoutClosure {
public:
    /// Binary function without closure
    /// \param operand1
    /// \param operand2
    /// \return result of Type R
    virtual R op(const T& operand1, const T& operand2) const = 0;
};

template <typename T>
class BinaryOperation: public BinaryOperationWithoutClosure<T, T>{
public:
    /// Binary function with closure
    /// a,b ∈ T then c = apply(a, b) ∈ T
    /// If apply is not defined for a, b ∈ T then apply is a partial binary operation
    /// \param operand1
    /// \param operand2
    /// \return result of Type T
    virtual T op(const T& operand1, const T& operand2) const = 0;
};

template <typename T>
class IAssociative: public virtual BinaryOperation<T>{
public:
    /// a,b,c in T => op(op(a, b), c) = op(a, op(b, c))
    /// Associativity is closed downwards which means that if R ⊆ T then op is associative under R
    /// \tparam FN
    /// \param generator
    /// \return
//    template <typename FN>
//    bool isAssociative(FN& generator) {
//        std::cout << "FN& = " << std::endl;
//        return isAssociative(generator);
//    };

    template <typename FN>
    bool isAssociative(FN&& generator) const {
        auto a = generator();
        auto b = generator();
        auto c = generator();
        auto lhs = this->op(a, this->op(b, c));
        std::cout << "LHS = " << lhs << std::endl;
        auto rhs = this->op(this->op(a, b), c);
        std::cout << "RHS = " << rhs << std::endl;
        return  lhs == rhs;
    }
};

template <typename T>
class SemiGroup: public virtual BinaryOperation<T>, public IAssociative<T>{};

template <typename T>
class ICommutative: public virtual BinaryOperation<T> {
public:
    /// a,b in T => op(a, b) = op(b, a)
    /// \param generator
    /// \return
    bool isCommutative(const std::function<T()> generator) const {
        auto a = generator();
        auto b = generator();
        auto lhs = this->op(a, b);
        std::cout << "LHS = " << lhs << std::endl;
        auto rhs = this->op(b, a);
        std::cout << "RHS = " << rhs << std::endl;
        return  lhs == rhs;
    }
};

/// Also known as AbelianSemiGroup
/// \tparam T
template <typename T>
class CommutativeSemiGroup: public SemiGroup<T>, public ICommutative<T>{};

template <typename T>
class Monoid: public SemiGroup<T> {
public:
    /// Identity element for a in T for the binary operation op(x, y)
    /// \return
    virtual T identity() const = 0;
};

template <typename T>
class CommutativeMonoid: public Monoid<T>, public ICommutative<T> {
public:
    /// Identity element for a in T for the binary operation op(x, y)
    /// \return
    virtual T identity() const = 0;
};

template <typename T>
class Group: public Monoid<T> {
public:
    /// Inverse element for a in T for the binary operation op(x, y)
    /// \return
    virtual T inverse(T a) const = 0;
};

/// Also known as AbelianGroup
template <typename T>
class CommutativeGroup: public Group<T>, public ICommutative<T>{};


template <typename T>
class IDistributive {
protected:
    const std::function<T(T, T)>& op1;
    const std::function<T(T, T)>& op2;

public:
    IDistributive(const std::function<T(T, T)>& op1, const std::function<T(T, T)>& op2): op1(op1), op2(op2) {}

    /// a, b, c int T is left distributive if (a op2 (b op1 c)) = ((a op2 b) op1 (a op2 c))
    /// \param generator
    /// \return
    bool isLeftDistributive(const std::function<T()>&& generator) const {
        T a = generator();
        T b = generator();
        T c = generator();
        T lhs = op2(a, op1(b, c));
        std::cout << "LHS = " << lhs << std::endl;
        T rhs = op1(op2(a, b), op2(a, c));
        std::cout << "RHS = " << rhs << std::endl;
        return lhs == rhs;
    }

    /// a, b, c int T is right distributive if ((b op1 c) op2 a) = ((b op2 a) op1 (c op2 a))
    /// \param generator
    /// \return
    bool isRightDistributive(const std::function<T()>&& generator) const {
        T a = generator();
        T b = generator();
        T c = generator();
        T lhs = op2(a, op1(b, c));
        std::cout << "LHS = " << lhs << std::endl;
        T rhs = op1(op2(b, a), op2(c, a));
        std::cout << "RHS = " << rhs << std::endl;
        return lhs == rhs;
    }
};

template <typename T>
class Ring: public IDistributive<T>{
    const CommutativeGroup<T>& group;
    const Monoid<T>& monoid;

public:
    Ring(CommutativeGroup<T>& group, Monoid<T>& monoid): IDistributive<T>([&group](T x, T y) -> T {
        return group.op(x, y); //is there an elegant way | or a right way
    }, [&monoid](T x, T y) -> T {
        return monoid.op(x, y); //is there an elegant way | or a right way
    }), group(group), monoid(monoid) {
    }

    CommutativeGroup<T> &getGroup() {
        return group;
    }

    Monoid<T> &getMonoid() {
        return monoid;
    }
};


#endif //MATHSTRUCTURESC___ABSTRACTALGEBRAICSTRUCTURES_H
