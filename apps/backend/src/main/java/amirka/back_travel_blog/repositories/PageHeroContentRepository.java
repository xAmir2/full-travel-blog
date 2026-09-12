package amirka.back_travel_blog.repositories;

import amirka.back_travel_blog.entities.PageHeroContent;
import amirka.back_travel_blog.enums.HeroPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PageHeroContentRepository
        extends JpaRepository<PageHeroContent, HeroPage> {
}