package dev.nelson.aven.finance.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record TransactionRequest(
        @NotNull Long accountId,
        @NotBlank @Pattern(regexp = "INCOME|EXPENSE") String type,
        @NotNull @DecimalMin(value = "0.01") @Digits(integer = 16, fraction = 4) BigDecimal amount,
        @NotBlank @Pattern(regexp = "USD|TZS") String currency,
        @NotBlank @Size(max = 120) String description,
        @Size(max = 60) String category,
        @Size(min = 12, max = 80) String idempotencyKey
) {}
