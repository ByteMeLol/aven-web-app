
package dev.nelson.aven.auth.controller;

import dev.nelson.aven.auth.service.ProfilePictureService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/users/me")
public class ProfilePictureController {

    private final ProfilePictureService profilePictureService;

    public ProfilePictureController(
            ProfilePictureService profilePictureService
    ) {
        this.profilePictureService = profilePictureService;
    }

    @PostMapping(
            value = "/profile-picture",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {

        String email = authentication.getName();

        String objectKey = profilePictureService.uploadProfilePicture(
                email,
                file
        );

        return ResponseEntity.ok(
                Map.of(
                        "message", "Profile picture uploaded successfully.",
                        "profilePictureKey", objectKey
                )
        );
    }

    @GetMapping("/profile-picture")
    public ResponseEntity<?> getProfilePicture(
            Authentication authentication
    ) {

        String email = authentication.getName();

        String imageUrl = profilePictureService.getProfilePictureUrl(email);

        if (imageUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "message", "No profile picture uploaded."
                    ));
        }

        return ResponseEntity.ok(
                Map.of("imageUrl", imageUrl)
        );
    }
}
