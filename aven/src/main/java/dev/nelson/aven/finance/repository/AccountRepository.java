package dev.nelson.aven.finance.repository;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.finance.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserOrderByDefaultAccountDescNameAsc(User user);
    Optional<Account> findByIdAndUser(Long id, User user);
    Optional<Account> findByUserAndDefaultAccountTrue(User user);
    boolean existsByUserAndNameIgnoreCase(User user, String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select a from Account a where a.id = :id and a.user = :user")
    Optional<Account> findForUpdate(@Param("id") Long id, @Param("user") User user);
}
