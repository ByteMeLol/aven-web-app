package dev.nelson.aven.finance.repository;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.finance.entity.FinanceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction, Long> {
    List<FinanceTransaction> findByUserOrderByOccurredAtDesc(User user);
    Optional<FinanceTransaction> findByIdAndUser(Long id, User user);
    Optional<FinanceTransaction> findByIdempotencyKeyAndUser(String idempotencyKey, User user);
}
