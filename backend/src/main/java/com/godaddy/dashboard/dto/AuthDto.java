package com.godaddy.dashboard.dto;

import lombok.Data;

public class AuthDto {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
        /** @deprecated use email */
        private String username;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private String email;

        public LoginResponse(String token, String email) {
            this.token = token;
            this.email = email;
        }
    }
}
