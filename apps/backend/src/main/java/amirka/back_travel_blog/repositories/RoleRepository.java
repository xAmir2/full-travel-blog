package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
