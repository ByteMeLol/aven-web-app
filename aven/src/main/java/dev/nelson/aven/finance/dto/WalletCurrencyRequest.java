package dev.nelson.aven.finance.dto;

import jakarta.validation.constraints.Pattern;

public record WalletCurrencyRequest(@Pattern(regexp = "USD|TZS") String currency) {}
