package dev.nelson.aven.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class JwtConfig {
    @Value ("${aven.jwt.secret}")
    private String jwtsecret;

    @Bean
    SecretKey secretKey(){
        byte[] keyBytes= Base64.getDecoder().decode(jwtsecret);
        return new SecretKeySpec(keyBytes,"HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey secretKey){
        return new NimbusJwtEncoder(
                new ImmutableSecret<>(secretKey)
        );

    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey secretKey){
        return  NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }
    
}
