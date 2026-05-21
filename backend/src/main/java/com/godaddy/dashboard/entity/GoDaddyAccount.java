package com.godaddy.dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "godaddy_accounts")
@Data
public class GoDaddyAccount {

    @Id
    private String id;

    private String accountName;

    private String encryptedApiKey;

    private String encryptedApiSecret;

    private LocalDateTime lastSyncedAt;

    private boolean active = true;
}
