package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.PageHeroContentDTO;
import amirka.back_travel_blog.DTOs.PageHeroContentResponseDTO;
import amirka.back_travel_blog.entities.PageHeroContent;
import amirka.back_travel_blog.enums.HeroPage;
import amirka.back_travel_blog.exceptions.BadRequestEx;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.repositories.PageHeroContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PageHeroContentService {

    private final PageHeroContentRepository pageHeroContentRepository;

    public PageHeroContentService(
            PageHeroContentRepository pageHeroContentRepository
    ) {
        this.pageHeroContentRepository = pageHeroContentRepository;
    }

    @Transactional(readOnly = true)
    public PageHeroContentResponseDTO getByPage(HeroPage page) {
        return toResponseDTO(findByPage(page));
    }

    @Transactional
    public PageHeroContentResponseDTO update(HeroPage page, PageHeroContentDTO payload) {
        PageHeroContent heroContent = findByPage(page);

        heroContent.updateCommonContent(
                payload.preTitle()
                        .trim(),
                payload.title()
                        .trim(),
                payload.description()
                        .trim()
        );

        if (page == HeroPage.HOME) {
            validateHomeContent(payload);

            heroContent.updateHomeContent(
                    payload.primaryButtonLabel()
                            .trim(),
                    payload.guestButtonLabel()
                            .trim(),
                    payload.note()
                            .trim(),
                    payload.featuredLabel()
                            .trim(),
                    payload.readStoryLabel()
                            .trim(),
                    payload.fallbackBrand()
                            .trim(),
                    payload.fallbackTitle()
                            .trim(),
                    payload.fallbackDescription()
                            .trim()
            );
        }

        PageHeroContent updatedHeroContent =
                pageHeroContentRepository.save(heroContent);

        return toResponseDTO(updatedHeroContent);
    }

    private PageHeroContent findByPage(HeroPage page) {
        return pageHeroContentRepository.findById(page)
                .orElseThrow(() -> new NotFoundEx("Hero content for page " + page + " was not found."));
    }

    private void validateHomeContent(PageHeroContentDTO payload) {
        requireText(payload.primaryButtonLabel(), "The primary button label is required for the homepage.");

        requireText(payload.guestButtonLabel(), "The guest button label is required for the homepage.");

        requireText(payload.note(), "The note is required for the homepage.");

        requireText(payload.featuredLabel(), "The featured label is required for the homepage.");

        requireText(payload.readStoryLabel(), "The read-story label is required for the homepage.");

        requireText(payload.fallbackBrand(), "The fallback brand is required for the homepage.");

        requireText(payload.fallbackTitle(), "The fallback title is required for the homepage.");

        requireText(payload.fallbackDescription(), "The fallback description is required for the homepage.");
    }

    private void requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestEx(message);
        }
    }

    private PageHeroContentResponseDTO toResponseDTO(
            PageHeroContent heroContent
    ) {
        return new PageHeroContentResponseDTO(
                heroContent.getPage(),
                heroContent.getPreTitle(),
                heroContent.getTitle(),
                heroContent.getDescription(),
                heroContent.getPrimaryButtonLabel(),
                heroContent.getGuestButtonLabel(),
                heroContent.getNote(),
                heroContent.getFeaturedLabel(),
                heroContent.getReadStoryLabel(),
                heroContent.getFallbackBrand(),
                heroContent.getFallbackTitle(),
                heroContent.getFallbackDescription(),
                heroContent.getCreatedAt(),
                heroContent.getUpdatedAt()
        );
    }
}