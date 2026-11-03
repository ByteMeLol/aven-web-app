package dev.nelson.aven.finance.dto;

import dev.nelson.aven.finance.entity.FinanceTransaction;

import java.math.BigDecimal;
import java.time.Instant;

public record TransactionResponse(Long id, Long accountId, String account, String type,
                                  BigDecimal amount, String currency, String description,
                                  String category, String provider, Instant occurredAt) {
    public static TransactionResponse from(FinanceTransaction transaction) {
        return new TransactionResponse(transaction.getId(), transaction.getAccount().getId(),
                transaction.getAccount().getName(), transaction.getType(), transaction.getAmount(),
                transaction.getCurrency(), transaction.getDescription(), transaction.getCategory(),
                transaction.getProvider(), transaction.getOccurredAt());
    }
}
