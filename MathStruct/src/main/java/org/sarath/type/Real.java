package org.sarath.type;

public class Real implements Number<Double> {

    private Double num;

    public Real(Double num) {
        this.num = num;
    }

    @Override
    public Double add(Double x) {
        return num + x;
    }

    @Override
    public Double sub(Double x) {
        return num - x;
    }

    @Override
    public Double mul(Double x) {
        return num * x;
    }

    @Override
    public Double div(Double x) {
        return num / x;
    }

    @Override
    public Double mod(Double x) {
        return num % x;
    }

    @Override
    public Double getNum() {
        return num;
    }

    @Override
    public String toString() {
        return "Real{" +
                "num=" + num +
                '}';
    }
}
