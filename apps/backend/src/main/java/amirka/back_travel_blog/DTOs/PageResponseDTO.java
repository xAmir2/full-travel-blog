package amirka.back_travel_blog.DTOs;

import java.util.List;

public record PageResponseDTO<T>(
        List<T> content,
        String nextCursor,
        boolean hasNext,
        int limit
) {
}