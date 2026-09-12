package amirka.back_travel_blog.exceptions;

public class AccessDeniedEx extends RuntimeException {

    public AccessDeniedEx(String message) {
        super(message);
    }
}