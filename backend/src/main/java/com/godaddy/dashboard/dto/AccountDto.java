package com.godaddy.dashboard.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class AccountDto {

    @Data
    public static class CreateRequest {
        private String accountName;
        private String apiKey;
        private String apiSecret;
    }

    @Data
    public static class Response {
        private String id;
        private String accountName;
        private LocalDateTime lastSyncedAt;
        private boolean active;
        private int domainCount;
    }
}
