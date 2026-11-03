package dev.nelson.aven.auth.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Optional;

@Entity
@Table(name="email_verification_tokens")
public class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id",nullable=false,unique = true)
    private User user;

    @Column(nullable = false, length = 255)
    private String otpHash;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected EmailVerificationToken(){

    }

    public EmailVerificationToken(User user, String otpHash, Instant expiresAt) {
        this.user = user;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isUsed() {
        return used;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }
}

