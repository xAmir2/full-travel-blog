package amirka.back_travel_blog.exceptions;

public class BadRequestEx extends RuntimeException {
    public BadRequestEx(String message) {
        super(message);
    }
}
