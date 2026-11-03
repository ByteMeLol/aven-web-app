
package dev.nelson.aven.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class R2Config {

    @Value("${R2_ENDPOINT}")
    private String endpoint;

    @Value("${R2_ACCESS_KEY_ID}")
    private String accessKeyId;

    @Value("${R2_SECRET_ACCESS_KEY}")
    private String secretAccessKey;

    private StaticCredentialsProvider credentialsProvider() {

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(
                        accessKeyId,
                        secretAccessKey
                );

        return StaticCredentialsProvider.create(credentials);
    }

    private S3Configuration s3Configuration() {

        return S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .build();
    }

    @Bean
    public S3Client s3Client() {

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Configuration())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {

        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of("auto"))
                .credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Configuration())
                .build();
    }
}
