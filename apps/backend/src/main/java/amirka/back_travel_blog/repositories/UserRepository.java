package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    @EntityGraph(attributePaths = {"role", "role.permissions"})
    Optional<User> findByEmailIgnoreCase(String email);

    @Override
    @EntityGraph(attributePaths = {"role", "role.permissions"})
    Optional<User> findById(UUID id);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, UUID id);

    boolean existsByRoleId(UUID roleId);
}
