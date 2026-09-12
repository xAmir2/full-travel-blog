package amirka.back_travel_blog.config;

import amirka.back_travel_blog.entities.PageHeroContent;
import amirka.back_travel_blog.entities.Permission;
import amirka.back_travel_blog.entities.Role;
import amirka.back_travel_blog.entities.User;
import amirka.back_travel_blog.enums.HeroPage;
import amirka.back_travel_blog.repositories.PageHeroContentRepository;
import amirka.back_travel_blog.repositories.PermissionRepository;
import amirka.back_travel_blog.repositories.RoleRepository;
import amirka.back_travel_blog.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminPassword;
    private final String adminEmail;
    private final PageHeroContentRepository pageHeroContentRepository;

    public DataSeeder(
            PermissionRepository permissionRepository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PageHeroContentRepository pageHeroContentRepository,
            PasswordEncoder passwordEncoder,
            @Value("${admin.password}") String adminPassword,
            @Value("${admin.email}") String adminEmail
    ) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.pageHeroContentRepository = pageHeroContentRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminPassword = adminPassword;
        this.adminEmail = adminEmail;
    }


    @Override
    @Transactional
    public void run(String... args) {
        Permission postRead = getOrCreatePermission("POST_READ");

        Permission postCreate = getOrCreatePermission("POST_CREATE");

        Permission postUpdate = getOrCreatePermission("POST_UPDATE");

        Permission postDelete = getOrCreatePermission("POST_DELETE");

        Permission userManage = getOrCreatePermission("USER_MANAGE");
        Permission commentModerate = getOrCreatePermission("COMMENT_MODERATE");

        Permission siteContentManage = getOrCreatePermission("SITE_CONTENT_MANAGE");

        createUserRole();

        createDefaultHeroContent();

        Role adminRole = createAdminRole(
                Set.of(
                        postRead,
                        postCreate,
                        postUpdate,
                        postDelete,
                        userManage,
                        commentModerate,
                        siteContentManage
                )
        );

        createAdminUser(adminRole);
    }

    private Permission getOrCreatePermission(String name) {
        return permissionRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> permissionRepository.save(new Permission(name)));
    }

    private void createUserRole() {
        if (roleRepository.findByNameIgnoreCase("USER")
                .isEmpty()) {
            roleRepository.save(new Role("USER"));
        }
    }

    private Role createAdminRole(Set<Permission> permissions) {
        Role adminRole = roleRepository.findByNameIgnoreCase("ADMIN")
                .orElseGet(() -> new Role("ADMIN"));

        adminRole.getPermissions()
                .addAll(new HashSet<>(permissions));

        return roleRepository.save(adminRole);
    }


    private void createAdminUser(Role adminRole) {
        if (!userRepository.existsByEmailIgnoreCase(adminEmail)) {
            User admin = new User("Admin", "Travel Blog", "admin", adminEmail, passwordEncoder.encode(adminPassword),
                    adminRole);

            userRepository.save(admin);
        }
    }

    private void createDefaultHeroContent() {
        if (!pageHeroContentRepository.existsById(HeroPage.HOME)) {
            PageHeroContent homeHero = new PageHeroContent(
                    HeroPage.HOME,
                    "A journal for curious travellers",
                    "Stories that make the world feel a little closer.",
                    "Settle in with thoughtful travel stories, honest experiences and useful ideas gathered along the way."
            );

            homeHero.updateHomeContent(
                    "Explore stories",
                    "Join the community",
                    "Made for slow reading, new ideas and the next journey.",
                    "Latest story",
                    "Read the story",
                    "Explore & Share",
                    "Every journey leaves a story behind.",
                    "A quiet corner for memories, photographs and discoveries from around the world."
            );

            pageHeroContentRepository.save(homeHero);
        }

        if (!pageHeroContentRepository.existsById(HeroPage.JOURNAL)) {
            PageHeroContent journalHero = new PageHeroContent(
                    HeroPage.JOURNAL,
                    "The travel journal",
                    "Stories, places and moments worth remembering.",
                    "Browse honest travel experiences, photographs and useful discoveries gathered from journeys near and far."
            );

            pageHeroContentRepository.save(journalHero);
        }
    }
}