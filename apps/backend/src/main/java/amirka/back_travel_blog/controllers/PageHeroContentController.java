package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.PageHeroContentDTO;
import amirka.back_travel_blog.DTOs.PageHeroContentResponseDTO;
import amirka.back_travel_blog.enums.HeroPage;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.services.PageHeroContentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/page-heroes")
public class PageHeroContentController {

    private final PageHeroContentService pageHeroContentService;

    public PageHeroContentController(PageHeroContentService pageHeroContentService) {
        this.pageHeroContentService = pageHeroContentService;
    }

    @GetMapping("/{page}")
    public PageHeroContentResponseDTO getByPage(@PathVariable HeroPage page) {
        return pageHeroContentService.getByPage(page);
    }

    @PutMapping("/{page}")
    @PreAuthorize("hasAuthority('SITE_CONTENT_MANAGE')")
    public PageHeroContentResponseDTO update(@PathVariable HeroPage page, @RequestBody @Validated PageHeroContentDTO dto, BindingResult validationResult) {
        checkValidation(validationResult);

        return pageHeroContentService.update(page, dto);
    }

    private void checkValidation(BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            throw new ValidationEx(validationResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getDefaultMessage())
                    .toList());
        }
    }
}