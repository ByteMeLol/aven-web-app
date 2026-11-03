package dev.nelson.aven.auth.repository;

import dev.nelson.aven.auth.entity.EmailVerificationToken;
import dev.nelson.aven.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken,Long> {

    Optional<EmailVerificationToken> findByUser(User user);
    void deleteByUser(User user);
}
