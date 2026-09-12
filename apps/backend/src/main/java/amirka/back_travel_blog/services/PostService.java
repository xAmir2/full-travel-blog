package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.*;
import amirka.back_travel_blog.entities.Post;
import amirka.back_travel_blog.entities.PostContentBlock;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.ContentType;
import amirka.back_travel_blog.enums.PostStatus;
import amirka.back_travel_blog.exceptions.AccessDeniedEx;
import amirka.back_travel_blog.exceptions.BadRequestEx;
import amirka.back_travel_blog.exceptions.FileUploadEx;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.repositories.CommentRepository;
import amirka.back_travel_blog.repositories.ContentBlockRepository;
import amirka.back_travel_blog.repositories.PostRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final ContentBlockRepository contentBlockRepository;
    private final CommentRepository commentRepository;
    private final UserService userService;
    private final Cloudinary cloudinary;
    private final ReactionService reactionService;

    public PostService(
            PostRepository postRepository,
            ContentBlockRepository contentBlockRepository,
            CommentRepository commentRepository,
            UserService userService,
            Cloudinary cloudinary,
            ReactionService reactionService
    ) {
        this.postRepository = postRepository;
        this.contentBlockRepository = contentBlockRepository;
        this.commentRepository = commentRepository;
        this.userService = userService;
        this.cloudinary = cloudinary;
        this.reactionService = reactionService;
    }

    @Transactional
    public Post createPost(PostDTO dto, User author) {
        Set<String> submittedImageIds =
                extractImageIdsFromDTOs(dto.contentBlocks());

        validateSubmittedImages(Set.of(), submittedImageIds, author);

        Post post = new Post(
                dto.title()
                        .trim(),
                generateSlug(dto.title()),
                dto.summary()
                        .trim(),
                dto.status(),
                author
        );

        Post savedPost = postRepository.save(post);

        saveBlocks(savedPost, dto.contentBlocks());

        return savedPost;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Slice<Post> getPublishedPosts(int limit, String cursor, String search) {
        if (limit < 1 || limit > 50) {
            throw new BadRequestEx("Limit must be between 1 and 50.");
        }

        String normalizedSearch = search == null ? "" : search.trim();

        if (normalizedSearch.length() > 100) {
            throw new BadRequestEx("Search term cannot exceed 100 characters.");
        }

        PageRequest pageRequest = PageRequest.of(0, limit);

        DecodedPostCursor decodedCursor = decodeCursor(cursor);

        boolean hasSearch = !normalizedSearch.isBlank();
        boolean hasCursor = decodedCursor != null;

        if (!hasSearch && !hasCursor) {
            return postRepository
                    .findByStatusOrderByPublishedAtDescIdDesc(PostStatus.PUBLISHED, pageRequest);
        }

        if (!hasSearch) {
            return postRepository.findPublishedPostsAfterCursor(
                    PostStatus.PUBLISHED,
                    decodedCursor.publishedAt(),
                    decodedCursor.postId(),
                    pageRequest
            );
        }

        if (!hasCursor) {
            return postRepository.searchPublishedPosts(
                    PostStatus.PUBLISHED,
                    normalizedSearch,
                    pageRequest
            );
        }

        return postRepository.searchPublishedPostsAfterCursor(
                PostStatus.PUBLISHED,
                normalizedSearch,
                decodedCursor.publishedAt(),
                decodedCursor.postId(),
                pageRequest
        );
    }

    public String createCursor(Post post) {
        if (post.getId() == null || post.getPublishedAt() == null) {
            throw new BadRequestEx("A cursor cannot be created for an unpublished post.");
        }

        String cursorValue = String.join(
                "|",
                "v1",
                post.getPublishedAt()
                        .toString(),
                post.getId()
                        .toString()
        );

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(cursorValue.getBytes(StandardCharsets.UTF_8));
    }

    public List<Post> getPostsByAuthor(User author) {
        return postRepository.findByUser(author);
    }

    public Post getPostById(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new NotFoundEx("Post not found with id: " + id));
    }

    public Post getPostBySlug(String slug) {
        return postRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundEx("Post not found with slug: " + slug));
    }

    public Post getPublishedPostBySlug(String slug) {
        return postRepository.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundEx("Published post not found with slug: " + slug));
    }

    @Transactional
    public Post updatePost(UUID id, PostDTO dto, User currentUser) {
        Post post = getPostById(id);

        List<PostContentBlock> existingBlocks = getPostBlocks(post);

        Set<String> existingImageIds = extractImageIds(existingBlocks);

        Set<String> submittedImageIds = extractImageIdsFromDTOs(dto.contentBlocks());

        validateSubmittedImages(existingImageIds, submittedImageIds, currentUser);

        Set<String> removedImageIds = new HashSet<>(existingImageIds);

        removedImageIds.removeAll(submittedImageIds);

        post.setTitle(dto.title()
                .trim());
        post.setSummary(dto.summary()
                .trim());
        post.setPostStatus(dto.status());

        contentBlockRepository.deleteByPost(post);
        contentBlockRepository.flush();

        saveBlocks(post, dto.contentBlocks());

        Post updatedPost = postRepository.save(post);

        for (String removedImageId : removedImageIds) {
            deleteImage(removedImageId);
        }

        return updatedPost;
    }

    @Transactional
    public void deletePost(UUID id, User currentUser) {
        Post post = getPostById(id);

        checkDeletePermission(post, currentUser);

        List<PostContentBlock> blocks = getPostBlocks(post);

        for (PostContentBlock block : blocks) {
            if (block.getContentType() != ContentType.IMAGE) {
                continue;
            }

            Object imageId = block.getContent()
                    .get("imageId");

            if (imageId instanceof String cloudinaryId && !cloudinaryId.isBlank()) {
                deleteImage(cloudinaryId);
            }
        }

        commentRepository.deleteByPost(post);
        contentBlockRepository.deleteByPost(post);
        postRepository.delete(post);
    }

    public List<PostContentBlock> getPostBlocks(Post post) {
        return contentBlockRepository
                .findByPostOrderByPositionAsc(post);
    }

    public PostImageResponseDTO uploadImage(MultipartFile image, User currentUser) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestEx("Post image is required.");
        }

        if (image.getContentType() == null || !image.getContentType()
                .startsWith("image/")) {
            throw new BadRequestEx("The uploaded file must be an image.");
        }

        String folder = "travel-blog/posts/" + currentUser.getId();

        try {
            Map<?, ?> result = cloudinary.uploader()
                    .upload(image.getBytes(), ObjectUtils.asMap("folder", folder));

            return new PostImageResponseDTO(
                    result.get("secure_url")
                            .toString(),
                    result.get("public_id")
                            .toString()
            );
        } catch (IOException exception) {
            throw new FileUploadEx("Unable to upload post image.");
        }
    }

    public void deleteTemporaryImage(String imageId, User currentUser) {
        if (imageId == null || imageId.isBlank()) {
            throw new BadRequestEx("Image ID is required.");
        }

        String expectedPrefix = "travel-blog/posts/" + currentUser.getId() + "/";

        if (!imageId.startsWith(expectedPrefix)) {
            throw new AccessDeniedEx("You cannot delete this image.");
        }

        deleteImage(imageId);
    }

    public PostsResponseDTO toResponseDTO(Post post, User currentUser) {
        List<ContentBlockResponseDTO> blocks = getPostBlocks(post)
                .stream()
                .map(block -> new ContentBlockResponseDTO(
                        block.getId(),
                        block.getContentType(),
                        block.getPosition(),
                        block.getContent()))
                .toList();

        return new PostsResponseDTO(
                post.getId(),
                post.getTitle(),
                post.getSlug(),
                post.getSummary(),
                post.getStatus(),
                userService.toResponseDTO(post.getUser()),
                blocks,
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getPublishedAt(),
                reactionService.getPostReactionSummary(post, currentUser));
    }

    private DecodedPostCursor decodeCursor(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }

        try {
            String decodedValue = new String(
                    Base64.getUrlDecoder()
                            .decode(cursor),
                    StandardCharsets.UTF_8
            );

            String[] cursorParts = decodedValue.split("\\|", -1);

            if (cursorParts.length != 3 || !cursorParts[0].equals("v1")) {
                throw new IllegalArgumentException();
            }

            return new DecodedPostCursor(LocalDateTime.parse(cursorParts[1]), UUID.fromString(cursorParts[2]));
        } catch (RuntimeException exception) {
            throw new BadRequestEx("The supplied post cursor is not valid.");
        }
    }

    private Set<String> extractImageIds(List<PostContentBlock> blocks) {
        Set<String> imageIds = new HashSet<>();

        for (PostContentBlock block : blocks) {
            if (block.getContentType() != ContentType.IMAGE) {
                continue;
            }

            Object imageId = block.getContent()
                    .get("imageId");

            if (imageId instanceof String id && !id.isBlank()) {
                imageIds.add(id);
            }
        }

        return imageIds;
    }

    private Set<String> extractImageIdsFromDTOs(List<ContentBlockDTO> blocks) {
        Set<String> imageIds = new HashSet<>();

        for (ContentBlockDTO block : blocks) {
            if (block.type() != ContentType.IMAGE) {
                continue;
            }

            Object imageId = block.content()
                    .get("imageId");

            if (imageId instanceof String id && !id.isBlank()) {
                imageIds.add(id);
            }
        }

        return imageIds;
    }

    private void validateSubmittedImages(Set<String> existingImageIds, Set<String> submittedImageIds, User currentUser) {
        String expectedPrefix = "travel-blog/posts/" + currentUser.getId() + "/";

        boolean containsUnauthorizedImage = submittedImageIds.stream()
                .anyMatch(
                        imageId -> !existingImageIds.contains(imageId) && !imageId.startsWith(expectedPrefix));

        if (containsUnauthorizedImage) {
            throw new AccessDeniedEx("One or more images do not belong to you.");
        }
    }

    private void saveBlocks(Post post, List<ContentBlockDTO> blockDTOs) {
        List<PostContentBlock> blocks = new ArrayList<>();

        for (int position = 0; position < blockDTOs.size(); position++) {
            ContentBlockDTO dto = blockDTOs.get(position);

            validateBlock(dto);

            Map<String, Object> content = new HashMap<>(dto.content());

            PostContentBlock block = new PostContentBlock(post, dto.type(), position, content);

            blocks.add(block);
        }

        contentBlockRepository.saveAll(blocks);
    }

    private void validateBlock(ContentBlockDTO dto) {
        if (dto.type() == ContentType.TEXT) {
            Object value = dto.content()
                    .get("value");

            if (
                    !(value instanceof String text) ||
                            text.isBlank()
            ) {
                throw new BadRequestEx("Text blocks require a value.");
            }
        }

        if (dto.type() == ContentType.IMAGE) {
            Object url = dto.content()
                    .get("url");
            Object imageId =
                    dto.content()
                            .get("imageId");

            if (!(url instanceof String imageUrl) ||
                    imageUrl.isBlank() ||
                    !(imageId instanceof String id) ||
                    id.isBlank()
            ) {
                throw new BadRequestEx("Image blocks require a URL and image ID.");
            }
        }
    }

    private void deleteImage(String imageId) {
        try {
            cloudinary.uploader()
                    .destroy(imageId, ObjectUtils.emptyMap());
        } catch (IOException exception) {
            throw new FileUploadEx("Unable to delete post image.");
        }
    }

    private void checkDeletePermission(Post post, User currentUser) {
        boolean isOwner =
                post.getUser()
                        .getId()
                        .equals(currentUser.getId());

        boolean isAdmin =
                currentUser.getRole()
                        .getName()
                        .equalsIgnoreCase("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedEx("You can only delete your own posts.");
        }
    }

    private String generateSlug(String title) {
        String slug = Normalizer
                .normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        String uniqueSlug = slug;
        int number = 2;

        while (postRepository.existsBySlug(uniqueSlug)) {
            uniqueSlug = slug + "-" + number;
            number++;
        }

        return uniqueSlug;
    }

    private record DecodedPostCursor(LocalDateTime publishedAt, UUID postId) {
    }
}
