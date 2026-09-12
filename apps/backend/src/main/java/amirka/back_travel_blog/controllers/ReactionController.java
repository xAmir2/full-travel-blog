package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.ReactionDTO;
import amirka.back_travel_blog.DTOs.ReactionResponseDTO;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.services.ReactionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping
public class ReactionController {

    private final ReactionService reactionService;

    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    @GetMapping("/posts/{postId}/reactions")
    public ReactionResponseDTO getPostReactions(@PathVariable UUID postId, @AuthenticationPrincipal User currentUser) {
        return reactionService.getPostReactionSummary(postId, currentUser);
    }

    @PostMapping("/posts/{postId}/reactions")
    @PreAuthorize("isAuthenticated()")
    public ReactionResponseDTO reactToPost(@PathVariable UUID postId, @RequestBody @Validated ReactionDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        return reactionService.reactToPost(postId, dto.reactionType(), currentUser);
    }

    @GetMapping("/comments/{commentId}/reactions")
    public ReactionResponseDTO getCommentReactions(@PathVariable UUID commentId, @AuthenticationPrincipal User currentUser) {
        return reactionService.getCommentReactionSummary(commentId, currentUser);
    }

    @PostMapping("/comments/{commentId}/reactions")
    @PreAuthorize("isAuthenticated()")
    public ReactionResponseDTO reactToComment(@PathVariable UUID commentId, @RequestBody @Validated ReactionDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        return reactionService.reactToComment(
                commentId,
                dto.reactionType(),
                currentUser
        );
    }

    private void checkValidation(BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            throw new ValidationEx(
                    validationResult.getFieldErrors()
                            .stream()
                            .map(error -> error.getDefaultMessage())
                            .toList()
            );
        }
    }
}