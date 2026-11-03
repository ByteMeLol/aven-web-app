package dev.nelson.aven.finance.dto;

import dev.nelson.aven.finance.entity.Account;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountResponse(Long id, String name, String type, String currency,
                              BigDecimal balance, boolean defaultAccount, Instant createdAt) {
    public static AccountResponse from(Account account) {
        return new AccountResponse(account.getId(), account.getName(), account.getType(),
                account.getCurrency(), account.getBalance(), account.isDefaultAccount(), account.getCreatedAt());
    }
}
