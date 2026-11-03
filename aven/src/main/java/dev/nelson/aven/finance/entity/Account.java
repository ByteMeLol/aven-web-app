package dev.nelson.aven.finance.entity;

import dev.nelson.aven.auth.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "finance_accounts", indexes = {
        @Index(name = "idx_account_user", columnList = "user_id"),
        @Index(name = "idx_account_user_currency", columnList = "user_id,currency")
})
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 20, scale = 4)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean defaultAccount;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Account() {}

    public Account(User user, String name, String type, String currency, boolean defaultAccount) {
        this.user = user;
        this.name = name;
        this.type = type;
        this.currency = currency;
        this.defaultAccount = defaultAccount;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getName() { return name; }
    public String getType() { return type; }
    public String getCurrency() { return currency; }
    public BigDecimal getBalance() { return balance; }
    public boolean isDefaultAccount() { return defaultAccount; }
    public Instant getCreatedAt() { return createdAt; }
    public void changeBalance(BigDecimal amount) { balance = balance.add(amount); }
    public void changeCurrency(String currency) { this.currency = currency; }
}
