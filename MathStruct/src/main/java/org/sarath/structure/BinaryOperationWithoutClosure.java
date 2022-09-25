package org.sarath.structure;

@FunctionalInterface
public interface BinaryOperationWithoutClosure<T, R> {

    /**
     * Binary function without closure
     * @param operand1
     * @param operand2
     * @return result of type R
     */
     R op(T operand1, T operand2);

}

