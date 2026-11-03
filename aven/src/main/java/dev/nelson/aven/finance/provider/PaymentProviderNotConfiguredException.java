package dev.nelson.aven.finance.provider;

public class PaymentProviderNotConfiguredException extends RuntimeException {
    public PaymentProviderNotConfiguredException(String message) {
        super(message);
    }
}
