package dev.nelson.aven.auth.service;

import dev.nelson.aven.auth.dto.LoginRequest;
import dev.nelson.aven.auth.dto.LoginResponse;
import dev.nelson.aven.auth.dto.RegisterRequest;
import dev.nelson.aven.auth.entity.User;
import dev.nelson.aven.auth.repository.UserRepository;
import dev.nelson.aven.finance.entity.Account;
import dev.nelson.aven.finance.repository.AccountRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final EmailVerificationService emailVerificationService;
    private final AccountRepository accountRepository;

    private static final SecureRandom RANDOM = new SecureRandom();

    // Excludes confusing characters such as 0, O, 1 and I.
    private static final String AVEN_ID_CHARACTERS =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public AuthService(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            JwtEncoder jwtEncoder,
            EmailVerificationService emailVerificationService,
            AccountRepository accountRepository
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.emailVerificationService=emailVerificationService;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public User register(RegisterRequest request) {

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (users.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String avenId = generateUniqueAvenId();

        User user = new User(
                avenId,
                email,
                passwordEncoder.encode(request.password()),
                request.firstName().trim(),
                request.lastName().trim()
        );

        User savedUser = users.save(user);
        accountRepository.save(new Account(savedUser, "Aven Wallet", "AVEN_WALLET", "USD", true));

        // Send email verification OTP
        emailVerificationService.sendVerificationCode(savedUser);

        return savedUser;
    }

    private String generateUniqueAvenId() {
        String avenId;

        do {
            StringBuilder randomPart = new StringBuilder();

            for (int i = 0; i < 6; i++) {
                int index = RANDOM.nextInt(AVEN_ID_CHARACTERS.length());
                randomPart.append(AVEN_ID_CHARACTERS.charAt(index));
            }

            avenId = "AVN-" + randomPart;

        } while (users.existsByAvenId(avenId));

        return avenId;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        User user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid email or password")
                );

        boolean passwordMatches = passwordEncoder.matches(
                request.password(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Please verify your email before logging in."
            );
        }

        Instant now = Instant.now();
        long expiresIn = Duration.ofMinutes(15).toSeconds();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("aven")
                .subject(user.getEmail())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiresIn))
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();

        String token = jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        ).getTokenValue();

        return new LoginResponse(token, "Bearer", expiresIn);
    }
}