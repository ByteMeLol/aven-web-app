package dev.nelson.aven.finance.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record AccountRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Size(max = 30) String type,
        @NotBlank @Pattern(regexp = "USD|TZS") String currency,
        @DecimalMin(value = "0.0") @Digits(integer = 16, fraction = 4) BigDecimal openingBalance
) {}
