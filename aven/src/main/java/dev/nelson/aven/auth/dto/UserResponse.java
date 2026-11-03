package dev.nelson.aven.auth.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String avenId,
        String firstName,
        String lastName,
        String email,
        Instant createdAt
) {}