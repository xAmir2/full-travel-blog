package amirka.back_travel_blog.entities;

import amirka.back_travel_blog.enums.HeroPage;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_hero_content")
@Getter
public class PageHeroContent {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "page", length = 20)
    private HeroPage page;

    @Column(name = "pre_title", nullable = false, length = 120)
    private String preTitle;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "primary_button_label", length = 80)
    private String primaryButtonLabel;

    @Column(name = "guest_button_label", length = 80)
    private String guestButtonLabel;

    @Column(length = 250)
    private String note;

    @Column(name = "featured_label", length = 80)
    private String featuredLabel;

    @Column(name = "read_story_label", length = 80)
    private String readStoryLabel;

    @Column(name = "fallback_brand", length = 100)
    private String fallbackBrand;

    @Column(name = "fallback_title", length = 255)
    private String fallbackTitle;

    @Column(name = "fallback_description", length = 500)
    private String fallbackDescription;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public PageHeroContent() {
    }

    public PageHeroContent(HeroPage page, String preTitle, String title, String description) {
        this.page = page;
        this.preTitle = preTitle;
        this.title = title;
        this.description = description;
    }

    public void updateCommonContent(String preTitle, String title, String description) {
        this.preTitle = preTitle;
        this.title = title;
        this.description = description;
    }

    public void updateHomeContent(
            String primaryButtonLabel,
            String guestButtonLabel,
            String note,
            String featuredLabel,
            String readStoryLabel,
            String fallbackBrand,
            String fallbackTitle,
            String fallbackDescription
    ) {
        this.primaryButtonLabel = primaryButtonLabel;
        this.guestButtonLabel = guestButtonLabel;
        this.note = note;
        this.featuredLabel = featuredLabel;
        this.readStoryLabel = readStoryLabel;
        this.fallbackBrand = fallbackBrand;
        this.fallbackTitle = fallbackTitle;
        this.fallbackDescription = fallbackDescription;
    }

    @PrePersist
    private void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}