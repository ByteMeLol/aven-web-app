
package dev.nelson.aven.storage;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/storage")
public class StorageTestController {

    private final R2StorageService storageService;

    public StorageTestController(R2StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(
            value = "/test-upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> testUpload(
            @RequestParam("file") MultipartFile file) {

        try {
            String objectKey = storageService.uploadProfilePicture(file);

            return ResponseEntity.ok(
                    new UploadResponse(
                            "Image uploaded successfully to Cloudflare R2.",
                            objectKey
                    )
            );

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(e.getMessage())
            );

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Could not read the uploaded image."));
        }
    }

    public record UploadResponse(String message, String objectKey) {}

    public record ErrorResponse(String message) {}
}
