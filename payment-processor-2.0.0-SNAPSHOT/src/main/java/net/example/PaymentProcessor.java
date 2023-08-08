package net.example;

import org.apache.camel.builder.RouteBuilder;

import io.quarkus.logging.Log;

public class PaymentProcessor extends RouteBuilder {
    @Override
    public void configure() throws Exception {
        rest("/api/pay")
            .get()
            .produces("text/plain")
            .to("braintree://clientToken/generate");
        }
}
