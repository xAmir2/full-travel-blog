package amirka.back_travel_blog.exceptions;

import amirka.back_travel_blog.DTOs.ErrorDTO;
import amirka.back_travel_blog.DTOs.ErrorListDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GeneralExceptionHandler {

    @ExceptionHandler(NotFoundEx.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorDTO handleNotFound(NotFoundEx ex) {
        return new ErrorDTO(ex.getMessage(), LocalDateTime.now());
    }

    @ExceptionHandler(BadRequestEx.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorDTO handleBadRequest(BadRequestEx ex) {
        return new ErrorDTO(ex.getMessage(), LocalDateTime.now());
    }

    @ExceptionHandler(ValidationEx.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorListDTO handleValidation(ValidationEx ex) {
        return new ErrorListDTO(ex.getMessage(), LocalDateTime.now(), ex.getErrorMessages());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorDTO handleUnreadableRequest(HttpMessageNotReadableException ex) {
        return new ErrorDTO("The request body contains an invalid value.", LocalDateTime.now());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorDTO handleGenericEx(Exception ex) {
        ex.printStackTrace();

        return new ErrorDTO("Internal server error. We are currently working on it, if it persist contact support.",
                LocalDateTime.now());
    }

    @ExceptionHandler(FileUploadEx.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorDTO handleFileUpload(FileUploadEx ex) {
        return new ErrorDTO(ex.getMessage(), LocalDateTime.now());
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorDTO handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return new ErrorDTO("File size exceed the maximum allowed size (5mb)", LocalDateTime.now());
    }

    @ExceptionHandler(UnauthorizedEx.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorDTO handleUnauthorized(UnauthorizedEx ex) {
        return new ErrorDTO(ex.getMessage(), LocalDateTime.now());
    }

    @ExceptionHandler(AccessDeniedEx.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorDTO handleAccessDenied(AccessDeniedEx ex) {
        return new ErrorDTO(ex.getMessage(), LocalDateTime.now());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorDTO handleSpringAccessDenied(AccessDeniedException ex) {
        return new ErrorDTO("You do not have permission to perform this action.", LocalDateTime.now());
    }

}
