package org.sarath.type;

public interface Number<T> {
    T add(T x);
    T sub(T x);
    T mul(T x);
    T div(T x);
    T mod(T x);

    T getNum();
}
