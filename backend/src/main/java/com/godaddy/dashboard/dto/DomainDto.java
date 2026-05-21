package com.godaddy.dashboard.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class DomainDto {

    @Data
    public static class Response {
        private String id;
        private String domainName;
        private String accountName;
        private String accountId;
        private LocalDateTime expiryDate;
        private String status;
        private String clientTag;
    }

    @Data
    public static class DashboardStats {
        private long totalDomains;
        private long expiringSoon;
        private long totalAccounts;
        private long expiredDomains;
        private List<Response> recentExpiring;
    }

    @Data
    public static class TagUpdateRequest {
        private String clientTag;
    }
}
