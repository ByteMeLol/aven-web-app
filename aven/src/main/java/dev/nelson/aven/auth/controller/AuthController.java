 
package dev.nelson.aven.auth.controller;

import dev.nelson.aven.auth.dto.*;
import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.service.AuthService;
import dev.nelson.aven.auth.service.EmailVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(AuthService authService,EmailVerificationService emailVerificationService) {
        this.authService = authService;
        this.emailVerificationService=emailVerificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        try {
            User user = authService.register(request);

            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getAvenId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getCreatedAt()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }


    public record ErrorResponse(String message) {}


    @PostMapping("/login")
    public  ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {

        try {
            emailVerificationService.verifyCode(
                    request.email(),
                    request.otp()
            );

            return ResponseEntity.ok(
                    new SuccessResponse("Email verified successfully.")
            );

        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(exception.getMessage()));
        }
    }
    public record SuccessResponse(String message) {}
}
