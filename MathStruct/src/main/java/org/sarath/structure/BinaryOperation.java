package org.sarath.structure;

public interface BinaryOperation<T> extends BinaryOperationWithoutClosure<T, T> {
    /**
     * Binary function with closure
     * a,b ∈ T then c = apply(a, b) ∈ T
     * If apply is not defined for a, b ∈ T then apply is a partial binary operation
     * @param operand1
     * @param operand2
     * @return result of type T
     */
    T op(T operand1, T operand2);
}
