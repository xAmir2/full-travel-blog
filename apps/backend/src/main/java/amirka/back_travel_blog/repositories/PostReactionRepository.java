package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.PostReaction;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, UUID> {

    Optional<PostReaction> findByPostAndUser(Post post, User user);

    long countByPostAndReactionType(Post post, ReactionType reactionType);

    void deleteByPost(Post post);
}