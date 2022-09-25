#include <iostream>
#include "AbstractAlgebraicStructures.h"

typedef class : public SemiGroup<int> {

    int op(const int& operand1, const int& operand2) const {
        return operand1 + operand2;
    }

} IntSemiGroup;

typedef class : public CommutativeSemiGroup<int> {

    int op(const int& operand1, const int& operand2) const {
        return operand1 * operand2;
    }

} IntCommutativeSemiGroup;

typedef class : public Monoid<double> {
public:
    double op(const double& operand1, const double& operand2) const {
        return operand1 * operand2;
    }

    double identity() const {
        return 1;
    }

} RealMonoid;

typedef class : public Group<int> {
public:
    int op(const int& operand1, const int& operand2) const {
        return operand1 + operand2;
    }

    int identity() const {
        return 0;
    }

    int inverse(int a) const {
        return -a;
    }

} IntGroup;

typedef class : public CommutativeGroup<int> {
public:
    int op(const int& operand1, const int& operand2) const {
        return operand1 + operand2;
    }

    int identity() const {
        return 0;
    }

    int inverse(int a) const {
        return -a;
    }

} IntCommutativeGroup;

typedef class : public Monoid<int> {
public:
    int op(const int& operand1, const int& operand2) const {
        return operand1 * operand2;
    }

    int identity() const {
        return 1;
    }

} IntMonoid;

class IntRing: public Ring<int> {

public:
    IntRing(CommutativeGroup<int>& group, Monoid<int>& monoid): Ring<int>(group, monoid){};
};

void testIntSemiGroup();
void testIntCommutativeSemiGroup();
void testRealMonoid();
void testIntGroup();
void testIntCommutativeGroup();

int main() {
    testIntSemiGroup();
    testIntCommutativeSemiGroup();
    testRealMonoid();
    testIntGroup();
    testIntCommutativeGroup();
    return 0;
}

void testIntSemiGroup() {
    IntSemiGroup semiGroup;
    int i = 0;
    bool res = semiGroup.isAssociative([&, i] () mutable -> int {
        i = i + 10;
        return i;
    });

    std::cout << "IntSemiGroup -> IsAssociative? " << (res ? "true" : "false") << std::endl;

//    i = 0;
//    auto gen = [&, i] () mutable -> int {
//        i = i + 20;
//        return i;
//    };
//
//    res = semiGroup.isAssociative(gen);
//    std::cout << "IntSemiGroup -> IsAssociative? " << (res ? "true" : "false") << std::endl;
}

void testIntCommutativeSemiGroup() {
    IntCommutativeSemiGroup semiGroup;
    int i = 0;
    bool res = semiGroup.isAssociative([&, i] () mutable -> int {
        i = i + 2;
        return i;
    });

    std::cout << "IntCommutativeSemiGroup -> IsAssociative? " << (res ? "true" : "false") << std::endl;

    i = 0;
    auto gen = [&, i] () mutable -> int {
        i = i + 3;
        return i;
    };

    res = semiGroup.isCommutative(gen);
    std::cout << "IntCommutativeSemiGroup -> IsCommutative? " << (res ? "true" : "false") << std::endl;
}

void testRealMonoid() {
    RealMonoid monoid;
    double i = 0;
    auto gen = [&, i] () mutable -> double {
        i = i + 2;
        return i;
    };
    bool res = monoid.isAssociative(gen);

    auto a = gen();

    auto identity = monoid.identity();

    std::cout << "RealMonoid -> IsAssociative? " << (res ? "true" : "false") << std::endl;

    std::cout << "RealMonoid -> identity (e) = " << identity << std::endl;

    std::cout << "RealMonoid -> e * a =  " << identity * a << ", a * e = " << a * identity << ", a " << a  << std::endl;

}

void testIntGroup() {
    IntGroup group;
    int i = 0;
    auto gen = [&, i]() mutable -> int {
        i = i + 3;
        return i;
    };

    bool res = group.isAssociative(gen);

    auto a = gen();

    auto identity = group.identity();

    auto aInverse = group.inverse(a);

    std::cout << "IntGroup -> IsAssociative? " << (res ? "true" : "false") << std::endl;

    std::cout << "IntGroup -> identity (e) = " << identity << std::endl;

    std::cout << "IntGroup -> e + a =  " << identity + a << ", a + e = " << a + identity << ", a " << a  << std::endl;

    std::cout << "IntGroup -> a + a' =  " <<  a + aInverse << ", e = " << identity << std::endl;
}
void testIntCommutativeGroup() {
    IntCommutativeGroup group;
    int i = 0;
    auto gen = [&, i]() mutable -> int {
        i = i + 3;
        return i;
    };

    bool res = group.isAssociative(gen);

    auto a = gen();

    auto identity = group.identity();

    auto aInverse = group.inverse(a);

    std::cout << "IntCommutativeGroup -> IsAssociative? " << (res ? "true" : "false") << std::endl;

    res = group.isCommutative(gen);

    std::cout << "IntCommutativeGroup -> IsCommutative? " << (res ? "true" : "false") << std::endl;

    std::cout << "IntCommutativeGroup -> identity (e) = " << identity << std::endl;

    std::cout << "IntCommutativeGroup -> e + a =  " << identity + a << ", a + e = " << a + identity << ", a " << a  << std::endl;

    std::cout << "IntCommutativeGroup -> a + a' =  " <<  a + aInverse << ", e = " << identity << std::endl;
}

