package amirka.back_travel_blog.controllers;

import amirka.back_travel_blog.DTOs.PageResponseDTO;
import amirka.back_travel_blog.DTOs.PostDTO;
import amirka.back_travel_blog.DTOs.PostImageResponseDTO;
import amirka.back_travel_blog.DTOs.PostsResponseDTO;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.ValidationEx;
import amirka.back_travel_blog.services.PostService;
import org.springframework.data.domain.Slice;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/manage")
    @PreAuthorize("hasAuthority('POST_READ')")
    public List<PostsResponseDTO> getAllPosts(@AuthenticationPrincipal User currentUser) {
        return postService.getAllPosts()
                .stream()
                .map(post -> postService.toResponseDTO(post, currentUser))
                .toList();
    }

    @GetMapping("/manage/{postId}")
    @PreAuthorize("hasAuthority('POST_READ')")
    public PostsResponseDTO getPostById(@PathVariable UUID postId, @AuthenticationPrincipal User currentUser) {
        Post post = postService.getPostById(postId);

        return postService.toResponseDTO(post, currentUser);
    }

    @GetMapping
    public PageResponseDTO<PostsResponseDTO> getPublishedPosts(@RequestParam(defaultValue = "9") int limit, @RequestParam(required = false) String cursor, @RequestParam(required = false) String search, @AuthenticationPrincipal User currentUser) {
        Slice<Post> postSlice = postService.getPublishedPosts(limit, cursor, search);

        List<Post> posts = postSlice.getContent();

        List<PostsResponseDTO> content = posts.stream()
                .map(post -> postService.toResponseDTO(post, currentUser))
                .toList();

        String nextCursor = null;

        if (postSlice.hasNext() && !posts.isEmpty()) {
            Post lastPost = posts.getLast();

            nextCursor = postService.createCursor(lastPost);
        }

        return new PageResponseDTO<>(content, nextCursor, postSlice.hasNext(), limit);
    }

    @GetMapping("/slug/{slug}")
    public PostsResponseDTO getPublishedPostBySlug(@PathVariable String slug, @AuthenticationPrincipal User currentUser) {
        Post post = postService.getPublishedPostBySlug(slug);

        return postService.toResponseDTO(post, currentUser);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public List<PostsResponseDTO> getMyPosts(@AuthenticationPrincipal User currentUser) {
        return postService.getPostsByAuthor(currentUser)
                .stream()
                .map(post -> postService.toResponseDTO(post, currentUser))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('POST_CREATE')")
    public PostsResponseDTO createPost(@RequestBody @Validated PostDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        Post post = postService.createPost(dto, currentUser);

        return postService.toResponseDTO(post, currentUser);
    }

    @PutMapping("/{postId}")
    @PreAuthorize("hasAuthority('POST_UPDATE')")
    public PostsResponseDTO updatePost(@PathVariable UUID postId, @RequestBody @Validated PostDTO dto, BindingResult validationResult, @AuthenticationPrincipal User currentUser) {
        checkValidation(validationResult);

        Post updatedPost = postService.updatePost(postId, dto, currentUser);

        return postService.toResponseDTO(updatedPost, currentUser);
    }

    @DeleteMapping("/{postId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAuthority('POST_DELETE') or hasRole('ADMIN')")
    public void deletePost(@PathVariable UUID postId, @AuthenticationPrincipal User currentUser) {
        postService.deletePost(postId, currentUser);
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyAuthority('POST_CREATE', 'POST_UPDATE')")
    public PostImageResponseDTO uploadPostImage(@RequestParam("image") MultipartFile image, @AuthenticationPrincipal User currentUser) {
        return postService.uploadImage(image, currentUser);
    }

    @DeleteMapping("/images")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyAuthority('POST_CREATE', 'POST_UPDATE')")
    public void deletePostImage(@RequestParam String imageId, @AuthenticationPrincipal User currentUser) {
        postService.deleteTemporaryImage(imageId, currentUser);
    }

    private void checkValidation(BindingResult validationResult) {
        if (validationResult.hasErrors()) {
            throw new ValidationEx(validationResult.getFieldErrors()
                    .stream()
                    .map(error -> error.getDefaultMessage())
                    .toList()
            );
        }
    }
}