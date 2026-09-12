package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    List<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtDesc(Post post);

    List<Comment> findByParentCommentOrderByCreatedAtAsc(Comment parentComment);

    List<Comment> findByUserOrderByCreatedAtDesc(User user);

    void deleteByPost(Post post);

    void deleteByUser(User user);
}