package group15.pantrypal.useritems;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserItemsRepository extends JpaRepository<UserItems, Long> {
    List<UserItems> findByUserId(Long userId);
    Optional<UserItems> findByIdAndUserId(Long id, Long userId);
}
