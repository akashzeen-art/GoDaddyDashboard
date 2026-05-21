package com.godaddy.dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "domains")
@Data
public class Domain {

    @Id
    private String id;

    @Indexed
    private String domainName;

    @Indexed
    private String accountId;

    private LocalDateTime expiryDate;

    private String status;

    private String clientTag;

    private LocalDateTime lastFetchedAt;
}
