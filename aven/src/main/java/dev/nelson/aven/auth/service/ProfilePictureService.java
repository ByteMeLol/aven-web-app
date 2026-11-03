
package dev.nelson.aven.auth.service;

import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.repository.UserRepository;
import dev.nelson.aven.storage.R2StorageService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ProfilePictureService {

    private final UserRepository userRepository;
    private final R2StorageService storageService;

    public ProfilePictureService(
            UserRepository userRepository,
            R2StorageService storageService
    ) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @Transactional
    public String uploadProfilePicture(String email, MultipartFile file)
            throws IOException {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found.")
                );

        String objectKey = storageService.uploadProfilePicture(file);

        user.setProfilePictureKey(objectKey);
        userRepository.save(user);

        return objectKey;
    }

    @Transactional(readOnly = true)
    public String getProfilePictureUrl(String email) {

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found.")
                );

        String objectKey = user.getProfilePictureKey();

        if (objectKey == null || objectKey.isBlank()) {
            return null;
        }

        return storageService.generatePresignedUrl(objectKey);
    }
}
