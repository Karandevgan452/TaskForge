package com.taskforge.unit.service;

import com.taskforge.dto.request.LoginRequest;
import com.taskforge.dto.request.RegisterRequest;
import com.taskforge.dto.response.AuthResponse;
import com.taskforge.exception.BadRequestException;
import com.taskforge.model.User;
import com.taskforge.repository.UserRepository;
import com.taskforge.security.JwtTokenProvider;
import com.taskforge.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .name("Alex Johnson")
                .email("alex@example.com")
                .password("secret123")
                .build();

        loginRequest = LoginRequest.builder()
                .email("alex@example.com")
                .password("secret123")
                .build();

        user = User.builder()
                .id("usr-123")
                .name("Alex Johnson")
                .email("alex@example.com")
                .password("encoded_secret")
                .createdAt(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void register_Success() {
        given(userRepository.existsByEmail("alex@example.com")).willReturn(false);
        given(passwordEncoder.encode("secret123")).willReturn("encoded_secret");
        given(userRepository.save(any(User.class))).willReturn(user);
        given(tokenProvider.generateToken(any())).willReturn("mock-jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("alex@example.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException when registering with duplicate email")
    void register_DuplicateEmail_ThrowsException() {
        given(userRepository.existsByEmail("alex@example.com")).willReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Email is already registered");
    }

    @Test
    @DisplayName("Should successfully login user with valid credentials")
    void login_Success() {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                com.taskforge.security.UserPrincipal.create(user), null
        );

        given(authenticationManager.authenticate(any())).willReturn(authentication);
        given(tokenProvider.generateToken(authentication)).willReturn("mock-jwt-token");
        given(userRepository.findById("usr-123")).willReturn(Optional.of(user));

        AuthResponse response = authService.login(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getUser().getId()).isEqualTo("usr-123");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when login authentication fails")
    void login_InvalidCredentials_ThrowsException() {
        given(authenticationManager.authenticate(any()))
                .willThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }
}
