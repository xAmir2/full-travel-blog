package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.CommentDTO;
import amirka.back_travel_blog.DTOs.CommentResponseDTO;
import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.services.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponseDTO> getCommentsByPost(@PathVariable UUID postId, @AuthenticationPrincipal User currentUser) {
        return commentService.getCommentsByPost(postId)
                .stream()
                .map(comment -> commentService.toResponseDTO(comment, currentUser))
                .toList();
    }

    @PostMapping("/posts/{postId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponseDTO createComment(@PathVariable UUID postId, @RequestBody @Validated CommentDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        Comment comment = commentService.createComment(postId, dto, currentUser);

        return commentService.toResponseDTO(comment, currentUser);
    }

    @GetMapping("/comments/me")
    public List<CommentResponseDTO> getMyComments(@AuthenticationPrincipal User currentUser) {
        return commentService.getCommentsByUser(currentUser)
                .stream()
                .map(comment -> commentService.toResponseDTO(comment, currentUser))
                .toList();
    }

    @PutMapping("/comments/{commentId}")
    public CommentResponseDTO updateComment(@PathVariable UUID commentId, @RequestBody @Validated CommentDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        Comment updatedComment = commentService.updateComment(commentId, dto, currentUser);

        return commentService.toResponseDTO(updatedComment, currentUser);
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable UUID commentId, @AuthenticationPrincipal User currentUser) {
        commentService.deleteComment(commentId, currentUser);
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