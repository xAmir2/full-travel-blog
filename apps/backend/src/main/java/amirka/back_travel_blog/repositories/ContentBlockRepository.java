package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.PostContentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentBlockRepository extends JpaRepository<PostContentBlock, UUID> {

    List<PostContentBlock> findByPostOrderByPositionAsc(Post post);

    void deleteByPost(Post post);
}
