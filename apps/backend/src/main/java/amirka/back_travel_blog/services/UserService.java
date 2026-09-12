package amirka.back_travel_blog.services;

import amirka.back_travel_blog.DTOs.*;
import amirka.back_travel_blog.entities.Role;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.exceptions.BadRequestEx;
import amirka.back_travel_blog.exceptions.FileUploadEx;
import amirka.back_travel_blog.exceptions.NotFoundEx;
import amirka.back_travel_blog.exceptions.UnauthorizedEx;
import amirka.back_travel_blog.repositories.CommentRepository;
import amirka.back_travel_blog.repositories.PostRepository;
import amirka.back_travel_blog.repositories.RoleRepository;
import amirka.back_travel_blog.repositories.UserRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final Cloudinary cloudinary;
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            Cloudinary cloudinary,
            CommentRepository commentRepository,
            PostRepository postRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.cloudinary = cloudinary;
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    public User register(RegisterDTO dto) {
        String email = dto.email()
                .trim()
                .toLowerCase();

        String username = dto.username()
                .trim();

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new BadRequestEx("Username already in use.");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestEx("Email already in use.");
        }

        Role role = roleRepository
                .findByNameIgnoreCase("USER")
                .orElseThrow(() -> new NotFoundEx("Default USER role not found."));

        User user = new User(dto.name()
                .trim(),
                dto.surname()
                        .trim(), username, email, passwordEncoder.encode(dto.password()), role
        );

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NotFoundEx("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return userRepository
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new NotFoundEx("User not found with email: " + email));
    }

    public User updateData(UUID id, UserDataUpdateDTO dto) {
        User user = findById(id);

        String email = dto.email()
                .trim()
                .toLowerCase();

        String username = dto.username()
                .trim();

        if (userRepository.existsByUsernameIgnoreCaseAndIdNot(username, id)) {
            throw new BadRequestEx("Username already in use.");
        }

        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new BadRequestEx("Email already in use.");
        }

        user.setName(dto.name()
                .trim());
        user.setSurname(dto.surname()
                .trim());
        user.setUsername(username);
        user.setEmail(email);

        return userRepository.save(user);
    }

    public void updatePassword(UUID id, UserPasswordUpdateDTO dto) {
        User user = findById(id);

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new BadRequestEx("Current password is incorrect.");
        }

        if (!dto.newPassword()
                .equals(dto.confirmNewPassword())) {
            throw new BadRequestEx("New passwords do not match.");
        }
        user.setPassword(passwordEncoder.encode(dto.newPassword()));

        userRepository.save(user);
    }

    public User updateAvatar(UUID id, UserAvatarUpdateDTO dto) {
        User user = findById(id);
        MultipartFile avatar = dto.avatar();

        if (avatar == null || avatar.isEmpty()) {
            throw new BadRequestEx("Avatar image is required.");
        }

        if (avatar.getContentType() == null ||
                !avatar.getContentType()
                        .startsWith("image/")) {
            throw new BadRequestEx("The uploaded file must be an image.");
        }

        try {
            Map<?, ?> result = cloudinary.uploader()
                    .upload(avatar.getBytes(), ObjectUtils.asMap("folder", "travel-blog/avatars"));

            String oldAvatarId = user.getAvatarId();

            user.setAvatarUrl(result.get("secure_url")
                    .toString());

            user.setAvatarId(result.get("public_id")
                    .toString());

            User savedUser = userRepository.save(user);

            if (oldAvatarId != null && !oldAvatarId.isBlank()) {
                cloudinary.uploader()
                        .destroy(oldAvatarId, ObjectUtils.emptyMap());
            }

            return savedUser;
        } catch (IOException ex) {
            throw new FileUploadEx("Unable to upload avatar.");
        }
    }

    public User changeRole(UUID userId, UUID roleId) {
        User user = findById(userId);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new NotFoundEx("Role not found with id: " + roleId));

        user.setRole(role);

        return userRepository.save(user);
    }

    @Transactional
    public void deleteMyAccount(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedEx("The current password is incorrect.");
        }

        if (!postRepository.findByUser(user)
                .isEmpty()) {
            throw new BadRequestEx("Accounts that own posts cannot be deleted.");
        }

        commentRepository.deleteByUser(user);

        userRepository.delete(user);
    }

    public UserResponseDTO toResponseDTO(User user) {
        Set<PermissionResponseDTO> permissions =
                user.getRole()
                        .getPermissions()
                        .stream()
                        .map(permission -> new PermissionResponseDTO(permission.getId(), permission.getName()))
                        .collect(Collectors.toSet());

        RoleResponseDTO role = new RoleResponseDTO(user.getRole()
                .getId(), user.getRole()
                .getName(), permissions);

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl(),
                role
        );
    }
}
