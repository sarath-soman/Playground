package org.sarath.structure;

import org.sarath.structure.BinaryOperation;

import java.util.function.Supplier;

public interface SemiGroup<T> extends BinaryOperation<T> {
    /**
     * a,b,c in T => op(op(a, b), c) = op(a, op(b, c))
     * Associativity is closed downwards which means that if R ⊆ T then op is associative under R
     * @param supplier
     * @return
     */
    default boolean isAssociative(Supplier<T> supplier) {
        T a, b, c;
        a = supplier.get();
        b = supplier.get();
        c = supplier.get();
        T lhs = op(op(a, b), c);
        System.out.println("LHS = " + lhs);
        T rhs = op(a, op(b, c));
        System.out.println("RHS = " + rhs);
        return lhs.equals(rhs);
    }
}
