package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.PostStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findBySlug(String slug);

    Slice<Post> findByStatusOrderByPublishedAtDescIdDesc(
            PostStatus status,
            Pageable pageable
    );

    @Query("""
            SELECT p
            FROM Post p
            WHERE p.status = :status
              AND (
                    p.publishedAt < :cursorPublishedAt
                    OR (
                        p.publishedAt = :cursorPublishedAt
                        AND p.id < :cursorId
                    )
              )
            ORDER BY p.publishedAt DESC, p.id DESC
            """)
    Slice<Post> findPublishedPostsAfterCursor(
            @Param("status") PostStatus status,
            @Param("cursorPublishedAt") LocalDateTime cursorPublishedAt,
            @Param("cursorId") UUID cursorId,
            Pageable pageable
    );

    @Query("""
            SELECT p
            FROM Post p
            JOIN p.user author
            WHERE p.status = :status
              AND (
                    LOWER(p.title)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(p.summary)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(author.username)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(author.name)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(author.surname)
                        LIKE LOWER(CONCAT('%', :search, '%'))
              )
            ORDER BY p.publishedAt DESC, p.id DESC
            """)
    Slice<Post> searchPublishedPosts(
            @Param("status") PostStatus status,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
            SELECT p
            FROM Post p
            JOIN p.user author
            WHERE p.status = :status
              AND (
                    LOWER(p.title)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(p.summary)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(author.username)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(author.name)
                        LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(author.surname)
                        LIKE LOWER(CONCAT('%', :search, '%'))
              )
              AND (
                    p.publishedAt < :cursorPublishedAt
                    OR (
                        p.publishedAt = :cursorPublishedAt
                        AND p.id < :cursorId
                    )
              )
            ORDER BY p.publishedAt DESC, p.id DESC
            """)
    Slice<Post> searchPublishedPostsAfterCursor(
            @Param("status") PostStatus status,
            @Param("search") String search,
            @Param("cursorPublishedAt") LocalDateTime cursorPublishedAt,
            @Param("cursorId") UUID cursorId,
            Pageable pageable
    );

    List<Post> findByUser(User user);

    boolean existsBySlug(String slug);

    Optional<Post> findBySlugAndStatus(
            String slug,
            PostStatus status
    );
}