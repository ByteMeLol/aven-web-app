package dev.nelson.aven.auth.dto;

import java.time.Instant;

public record UserProfileResponse(
        Long id,
        String avenId,
        String profilePictureKey,
        String firstName,
        String lastName,
        String email,
        boolean emailVerified,
        Instant createdAt
) {}