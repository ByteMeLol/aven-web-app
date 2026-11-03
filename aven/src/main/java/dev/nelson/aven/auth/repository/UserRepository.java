
package dev.nelson.aven.auth.repository;

import dev.nelson.aven.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    boolean existsByAvenId(String avenId);
    Optional<User> findByAvenId(String avenId);
}
