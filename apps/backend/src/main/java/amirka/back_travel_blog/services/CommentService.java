package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.CommentDTO;
import amirka.back_travel_blog.DTOs.CommentResponseDTO;
import amirka.back_travel_blog.entities.Comment;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.AccessDeniedEx;
import amirka.back_travel_blog.exceptions.BadRequestEx;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.repositories.CommentRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostService postService;
    private final UserService userService;
    private final ReactionService reactionService;
    private final NotificationService notificationService;

    public CommentService(
            CommentRepository commentRepository,
            PostService postService,
            UserService userService,
            ReactionService reactionService,
            NotificationService notificationService
    ) {
        this.commentRepository = commentRepository;
        this.postService = postService;
        this.userService = userService;
        this.reactionService = reactionService;
        this.notificationService = notificationService;
    }

    @Transactional
    public Comment createComment(UUID postId, CommentDTO dto, User author) {
        Post post = postService.getPostById(postId);

        Comment parentComment = null;

        if (dto.parentCommentId() != null) {
            parentComment = getCommentById(dto.parentCommentId());

            validateParentComment(parentComment, post);
        }

        Comment comment = new Comment(
                dto.content()
                        .trim(),
                author,
                post,
                parentComment
        );

        comment.setEditorState(
                normalizeEditorState(dto.editorState())
        );

        Comment savedComment = commentRepository.save(comment);

        notificationService.createReplyNotification(savedComment);

        return savedComment;
    }

    public List<Comment> getCommentsByPost(UUID postId) {
        Post post = postService.getPostById(postId);

        return commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtDesc(post);
    }

    public List<Comment> getCommentsByUser(User user) {
        return commentRepository
                .findByUserOrderByCreatedAtDesc(user);
    }

    public Comment getCommentById(UUID id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundEx("Comment not found with id: " + id));
    }

    public Comment updateComment(UUID id, CommentDTO dto, User currentUser) {
        Comment comment = getCommentById(id);

        checkOwnership(comment, currentUser);

        comment.setContent(dto.content()
                .trim());
        comment.setEditorState(normalizeEditorState(dto.editorState()));

        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId, User currentUser) {
        Comment comment = getCommentById(commentId);

        boolean isOwner = comment.getUser()
                .getId()
                .equals(currentUser.getId());

        boolean canModerate = currentUser.getAuthorities()
                .stream()
                .anyMatch(authority -> authority.getAuthority()
                        .equals("COMMENT_MODERATE"));

        if (!isOwner && !canModerate) {
            throw new AccessDeniedEx("You can only delete your own comments.");
        }

        commentRepository.delete(comment);
    }

    private void validateParentComment(Comment parentComment, Post post) {
        boolean belongsToSamePost = parentComment.getPost()
                .getId()
                .equals(post.getId());

        if (!belongsToSamePost) {
            throw new BadRequestEx("The parent comment does not belong to this post.");
        }

        if (parentComment.getParentComment() != null) {
            throw new BadRequestEx("Replies cannot be nested more than one level.");
        }
    }

    private void checkOwnership(Comment comment, User currentUser) {
        if (!comment.getUser()
                .getId()
                .equals(currentUser.getId())) {
            throw new AccessDeniedEx("You can only manage your own comments.");
        }
    }

    public CommentResponseDTO toResponseDTO(Comment comment, User currentUser) {
        UUID parentCommentId = comment.getParentComment() == null ? null : comment.getParentComment()
                .getId();

        List<CommentResponseDTO> replies = comment.getParentComment() == null
                ? commentRepository
                .findByParentCommentOrderByCreatedAtAsc(comment)
                .stream()
                .map(reply -> toResponseDTO(reply, currentUser))
                .toList()
                : List.of();

        return new CommentResponseDTO(
                comment.getId(),
                comment.getPost()
                        .getId(),
                parentCommentId,
                comment.getContent(),
                comment.getEditorState(),
                userService.toResponseDTO(comment.getUser()),
                comment.getCreatedAt(),
                comment.getUpdatedAt(),
                reactionService.getCommentReactionSummary(comment, currentUser),
                replies
        );
    }

    private String normalizeEditorState(String editorState) {
        if (editorState == null || editorState.isBlank()) {
            return null;
        }

        return editorState.trim();
    }
}