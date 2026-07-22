package com.taskforge.unit.security;

import com.taskforge.model.User;
import com.taskforge.security.JwtTokenProvider;
import com.taskforge.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        String secret = "9a4f2c8d7e1b5a3f6c8e0d2b4a6f8c1d3e5b7a9f0c2d4e6b8a0c2d4e6f8a0b2c";
        jwtTokenProvider = new JwtTokenProvider(secret, 3600000);

        User user = User.builder()
                .id("usr-jwt-99")
                .name("Security Tester")
                .email("tester@example.com")
                .password("password")
                .build();

        UserPrincipal principal = UserPrincipal.create(user);
        authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("Should generate valid JWT token and extract user ID")
    void generateAndValidateToken_Success() {
        String token = jwtTokenProvider.generateToken(authentication);

        assertThat(token).isNotBlank();
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUserIdFromJWT(token)).isEqualTo("usr-jwt-99");
    }

    @Test
    @DisplayName("Should return false when validating tampered or invalid token")
    void validateToken_InvalidToken_ReturnsFalse() {
        String invalidToken = "invalid.jwt.token";
        assertThat(jwtTokenProvider.validateToken(invalidToken)).isFalse();
    }
}
