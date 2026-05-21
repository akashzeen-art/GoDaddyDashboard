package com.godaddy.dashboard.service;

import com.godaddy.dashboard.entity.GoDaddyAccount;
import com.godaddy.dashboard.security.AesEncryptor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoDaddyApiService {

    private final RestTemplate restTemplate;
    private final AesEncryptor aesEncryptor;

    @Value("${godaddy.api.base-url}")
    private String baseUrl;

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchDomainsForAccount(GoDaddyAccount account) {
        try {
            String apiKey = aesEncryptor.decrypt(account.getEncryptedApiKey());
            String apiSecret = aesEncryptor.decrypt(account.getEncryptedApiSecret());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "sso-key " + apiKey + ":" + apiSecret);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            ResponseEntity<List> response = restTemplate.exchange(
                    baseUrl + "/domains?limit=500",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    List.class
            );

            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch domains for account {}: {}", account.getAccountName(), e.getMessage());
            return Collections.emptyList();
        }
    }
}
