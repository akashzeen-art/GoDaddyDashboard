package com.godaddy.dashboard.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DomainSyncScheduler {

    private final DomainService domainService;

    @Scheduled(fixedRateString = "${app.sync.interval-ms:86400000}")
    public void scheduledSync() {
        log.info("Starting scheduled domain sync...");
        int count = domainService.syncAllAccounts();
        log.info("Scheduled sync complete. Total domains synced: {}", count);
    }
}
