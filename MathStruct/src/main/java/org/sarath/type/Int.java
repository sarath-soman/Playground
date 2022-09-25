package org.sarath.type;

public class Int implements Number<Integer> {

    private Integer num;

    public Int(Integer num) {
        this.num = num;
    }

    @Override
    public Integer add(Integer x) {
        return num + x;
    }

    @Override
    public Integer sub(Integer x) {
        return num - x;
    }

    @Override
    public Integer mul(Integer x) {
        return num * x;
    }

    @Override
    public Integer div(Integer x) {
        return num / x;
    }

    @Override
    public Integer mod(Integer x) {
        return num % x;
    }

    @Override
    public Integer getNum() {
        return num;
    }

    @Override
    public String toString() {
        return "Int{" +
                "num=" + num +
                '}';
    }

}
