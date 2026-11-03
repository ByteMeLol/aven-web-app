package dev.nelson.aven.auth.controller;

import dev.nelson.aven.auth.dto.UserProfileResponse;
import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        UserProfileResponse response = new UserProfileResponse(
                user.getId(),
                user.getAvenId(),
                user.getProfilePictureKey(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.isEmailVerified(),
                user.getCreatedAt()


        );

        return ResponseEntity.ok(response);
    }
}