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

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:${ADMIN_PASSWORD:admin123}}")
    private String adminPassword;

    @PostConstruct
    public void seedAdmin() {
        if (userRepository.findByUsername(adminUsername).isEmpty()) {
            User user = new User();
            user.setUsername(adminUsername);
            user.setPassword(passwordEncoder.encode(adminPassword));
            userRepository.save(user);
        }
    }

    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        String token = jwtUtil.generateToken(req.getUsername());
        return new AuthDto.LoginResponse(token, req.getUsername());
    }
}
