package amirka.back_travel_blog.entities;

import amirka.back_travel_blog.enums.ContentType;
import jakarta.persistence.*;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "post_content_blocks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "position"})
})
@Getter
public class PostContentBlock {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false)
    private ContentType contentType;

    @Column(nullable = false)
    private int position;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "content", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> content = new HashMap<>();

    public PostContentBlock() {
    }

    public PostContentBlock(Post post, ContentType contentType, int position, Map<String, Object> content) {
        this.post = post;
        this.contentType = contentType;
        this.position = position;
        this.content = content;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public void setContent(Map<String, Object> content) {
        this.content = content;
    }
}
