package org.sarath;

import org.sarath.structure.SemiGroup;
import org.sarath.type.Int;
import org.sarath.type.Number;
import org.sarath.type.Real;

import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        var semiGroup = new SemiGroup<Number>() {

            @Override
            public Number op(Number operand1, Number operand2) {
                return new Number(op);
            }
        };

        final var i = new AtomicInteger(0);
        boolean isAssociative = semiGroup.isAssociative(() -> new Real(i.incrementAndGet()));
        System.out.println(isAssociative);
    }
}
