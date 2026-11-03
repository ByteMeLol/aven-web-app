package dev.nelson.aven.finance.entity;

import dev.nelson.aven.auth.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "finance_transactions", indexes = {
        @Index(name = "idx_transaction_user_date", columnList = "user_id,occurred_at"),
        @Index(name = "idx_transaction_account_date", columnList = "account_id,occurred_at")
})
public class FinanceTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false, precision = 20, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 120)
    private String description;

    @Column(length = 60)
    private String category;

    @Column(length = 30)
    private String provider;

    @Column(length = 80, unique = true)
    private String idempotencyKey;

    @Column(nullable = false, updatable = false)
    private Instant occurredAt = Instant.now();

    protected FinanceTransaction() {}

    public FinanceTransaction(User user, Account account, String type, BigDecimal amount,
                              String currency, String description, String category,
                              String provider, String idempotencyKey) {
        this.user = user;
        this.account = account;
        this.type = type;
        this.amount = amount;
        this.currency = currency;
        this.description = description;
        this.category = category;
        this.provider = provider;
        this.idempotencyKey = idempotencyKey;
    }

    public Long getId() { return id; }
    public Account getAccount() { return account; }
    public String getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getProvider() { return provider; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public Instant getOccurredAt() { return occurredAt; }
}
