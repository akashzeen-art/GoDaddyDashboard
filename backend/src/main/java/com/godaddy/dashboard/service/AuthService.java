package com.godaddy.dashboard.service;

import com.godaddy.dashboard.dto.AuthDto;
import com.godaddy.dashboard.entity.User;
import com.godaddy.dashboard.repository.UserRepository;
import com.godaddy.dashboard.security.JwtUtil;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:godaddy@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:${ADMIN_PASSWORD:Godaddy@123}}")
    private String adminPassword;

    @PostConstruct
    public void seedAdmin() {
        upsertAdminUser(adminEmail, adminPassword);
    }

    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {
        String email = resolveEmail(req);
        authManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.getPassword()));
        String token = jwtUtil.generateToken(email);
        return new AuthDto.LoginResponse(token, email);
    }

    private String resolveEmail(AuthDto.LoginRequest req) {
        if (req.getEmail() != null && !req.getEmail().isBlank()) {
            return req.getEmail().trim();
        }
        if (req.getUsername() != null && !req.getUsername().isBlank()) {
            return req.getUsername().trim();
        }
        throw new BadCredentialsException("Email is required");
    }

    private void upsertAdminUser(String email, String rawPassword) {
        userRepository.findByUsername(email).ifPresentOrElse(
                user -> {
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    userRepository.save(user);
                },
                () -> {
                    User user = new User();
                    user.setUsername(email);
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    userRepository.save(user);
                });
    }
}
