package dev.nelson.aven.auth.service;

import dev.nelson.aven.auth.entity.EmailVerificationToken;
import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.repository.EmailVerificationTokenRepository;
import dev.nelson.aven.auth.repository.UserRepository;
import dev.nelson.aven.email.EmailService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository) {

        this.tokenRepository = tokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository=userRepository;
    }

    @Transactional
    public void sendVerificationCode(User user) {

        // Generate a six-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

        // Hash the OTP before storing it
        String otpHash = passwordEncoder.encode(otp);

        // OTP expires after 10 minutes
        Instant expiresAt = Instant.now().plus(10, ChronoUnit.MINUTES);

        // Remove any previous OTP for this user
        tokenRepository.deleteByUser(user);

        // Save the new OTP hash
        EmailVerificationToken token =
                new EmailVerificationToken(user, otpHash, expiresAt);

        tokenRepository.save(token);

        // Send OTP to user's email
        emailService.sendMail(
                user.getEmail(),
                "Verify your Aven account",
                "Your Aven verification code is: " + otp
                        + "\n\nThis code expires in 10 minutes."
        );
    }
    @Transactional
    public void verifyCode(String email, String otp) {

        // Find the user by email
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid verification details."
                ));

        // Find the user's verification token
        EmailVerificationToken token = tokenRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No verification code found. Request a new one."
                ));

        // Check whether the code has already been used
        if (token.isUsed()) {
            throw new IllegalArgumentException(
                    "This verification code has already been used."
            );
        }

        // Check expiration
        if (Instant.now().isAfter(token.getExpiresAt())) {
            throw new IllegalArgumentException(
                    "Verification code has expired. Request a new one."
            );
        }

        // Compare submitted OTP with stored hash
        if (!passwordEncoder.matches(otp, token.getOtpHash())) {
            throw new IllegalArgumentException("Incorrect verification code.");
        }

        // Mark the user as verified
        user.setEmailVerified(true);

        // Mark the token as used
        token.setUsed(true);
    }
}