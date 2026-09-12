package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.CommentReaction;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, UUID> {

    Optional<CommentReaction> findByCommentAndUser(Comment comment, User user);

    long countByCommentAndReactionType(Comment comment, ReactionType reactionType);

    void deleteByComment(Comment comment);
}