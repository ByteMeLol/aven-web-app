
package dev.nelson.aven.storage;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.time.Duration;

import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class R2StorageService {

    private static final long MAX_FILE_SIZE = 1 * 1024 * 1024;

    private final S3Presigner s3Presigner;
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp"
    );

    private final S3Client s3Client;

    @Value("${R2_BUCKET_NAME}")
    private String bucketName;

    public R2StorageService(
            S3Client s3Client,
            S3Presigner s3Presigner
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    public String uploadProfilePicture(MultipartFile file) throws IOException {

        // 1. Check whether a file was provided
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image.");
        }

        // 2. Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Image must not exceed 1 MB."
            );
        }

        // 3. Validate content type
        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.containsKey(contentType)) {
            throw new IllegalArgumentException(
                    "Only JPEG, PNG and WEBP images are allowed."
            );
        }

        // 4. Generate a unique object key
        String extension = ALLOWED_TYPES.get(contentType);
        String objectKey = "profile-pictures/" + UUID.randomUUID() + "." + extension;

        // 5. Prepare the upload request
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .contentType(contentType)
                .build();

        // 6. Upload the image to Cloudflare R2
        byte[] fileBytes = file.getBytes();

        s3Client.putObject(
                request,
                RequestBody.fromBytes(fileBytes)
        );

        // 7. Return the object key
        return objectKey;
    }

    public String generatePresignedUrl(String objectKey) {

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();

        GetObjectPresignRequest presignRequest =
                GetObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(15))
                        .getObjectRequest(getObjectRequest)
                        .build();

        return s3Presigner.presignGetObject(presignRequest)
                .url()
                .toString();
    }

}
