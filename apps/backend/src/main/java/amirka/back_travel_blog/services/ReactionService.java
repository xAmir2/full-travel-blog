package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.ReactionResponseDTO;
import amirka.back_travel_blog.entities.*;
import amirka.back_travel_blog.enums.PostStatus;
import amirka.back_travel_blog.enums.ReactionType;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.repositories.CommentReactionRepository;
import amirka.back_travel_blog.repositories.CommentRepository;
import amirka.back_travel_blog.repositories.PostReactionRepository;
import amirka.back_travel_blog.repositories.PostRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class ReactionService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostReactionRepository postReactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final NotificationService notificationService;

    public ReactionService(
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostReactionRepository postReactionRepository,
            CommentReactionRepository commentReactionRepository,
            NotificationService notificationService
    ) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postReactionRepository = postReactionRepository;
        this.commentReactionRepository = commentReactionRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReactionResponseDTO reactToPost(UUID postId, ReactionType reactionType, User currentUser) {
        Post post = getPublishedPost(postId);

        Optional<PostReaction> existingReaction = postReactionRepository.findByPostAndUser(post, currentUser);

        if (existingReaction.isEmpty()) {
            PostReaction newReaction = new PostReaction(post, currentUser, reactionType);

            postReactionRepository.saveAndFlush(newReaction);

            notificationService.createOrUpdatePostReactionNotification(post, currentUser, reactionType);
        } else {
            PostReaction reaction = existingReaction.get();

            if (reaction.getReactionType() == reactionType) {
                postReactionRepository.delete(reaction);
                postReactionRepository.flush();

                notificationService.removePostReactionNotification(post, currentUser);
            } else {
                reaction.setReactionType(reactionType);

                postReactionRepository.saveAndFlush(reaction);

                notificationService.createOrUpdatePostReactionNotification(post, currentUser, reactionType);
            }
        }

        return getPostReactionSummary(post, currentUser);
    }

    @Transactional
    public ReactionResponseDTO reactToComment(UUID commentId, ReactionType reactionType, User currentUser) {
        Comment comment = getComment(commentId);

        if (comment.getPost()
                .getStatus() != PostStatus.PUBLISHED) {
            throw new NotFoundEx("The comment does not belong to a published post.");
        }

        Optional<CommentReaction> existingReaction = commentReactionRepository.findByCommentAndUser(comment,
                currentUser);

        if (existingReaction.isEmpty()) {
            CommentReaction newReaction = new CommentReaction(comment, currentUser, reactionType);

            commentReactionRepository.saveAndFlush(newReaction);

            notificationService.createOrUpdateCommentReactionNotification(comment, currentUser, reactionType);
        } else {
            CommentReaction reaction = existingReaction.get();

            if (reaction.getReactionType() == reactionType) {
                commentReactionRepository.delete(reaction);
                commentReactionRepository.flush();

                notificationService.removeCommentReactionNotification(comment, currentUser);
            } else {
                reaction.setReactionType(reactionType);

                commentReactionRepository.saveAndFlush(reaction);

                notificationService.createOrUpdateCommentReactionNotification(comment, currentUser, reactionType);
            }
        }

        return getCommentReactionSummary(comment, currentUser);
    }

    @Transactional
    public ReactionResponseDTO getPostReactionSummary(UUID postId, User currentUser) {
        Post post = getPublishedPost(postId);

        return getPostReactionSummary(post, currentUser);
    }

    @Transactional
    public ReactionResponseDTO getCommentReactionSummary(UUID commentId, User currentUser) {
        Comment comment = getComment(commentId);

        if (comment.getPost()
                .getStatus() != PostStatus.PUBLISHED) {
            throw new NotFoundEx("The comment does not belong to a published post.");
        }

        return getCommentReactionSummary(comment, currentUser);
    }

    public ReactionResponseDTO getPostReactionSummary(Post post, User currentUser) {
        long likeCount = postReactionRepository.countByPostAndReactionType(post, ReactionType.LIKE);

        long dislikeCount = postReactionRepository.countByPostAndReactionType(post, ReactionType.DISLIKE);

        ReactionType currentUserReaction = currentUser == null
                ? null
                : postReactionRepository
                .findByPostAndUser(post, currentUser)
                .map(PostReaction::getReactionType)
                .orElse(null);

        return new ReactionResponseDTO(
                likeCount,
                dislikeCount,
                currentUserReaction
        );
    }

    public ReactionResponseDTO getCommentReactionSummary(Comment comment, User currentUser) {
        long likeCount = commentReactionRepository.countByCommentAndReactionType(comment, ReactionType.LIKE);

        long dislikeCount = commentReactionRepository.countByCommentAndReactionType(comment, ReactionType.DISLIKE);

        ReactionType currentUserReaction = currentUser == null
                ? null
                : commentReactionRepository
                .findByCommentAndUser(comment, currentUser)
                .map(CommentReaction::getReactionType)
                .orElse(null);

        return new ReactionResponseDTO(
                likeCount,
                dislikeCount,
                currentUserReaction
        );
    }

    private Post getPublishedPost(UUID postId) {
        return postRepository
                .findById(postId)
                .filter(post -> post.getStatus() == PostStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundEx("Published post not found with id: " + postId));
    }

    private Comment getComment(UUID commentId) {
        return commentRepository
                .findById(commentId)
                .orElseThrow(() -> new NotFoundEx("Comment not found with id: " + commentId));
    }
}