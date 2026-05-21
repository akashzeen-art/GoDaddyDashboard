package com.godaddy.dashboard.controller;

import com.godaddy.dashboard.dto.DomainDto;
import com.godaddy.dashboard.entity.GoDaddyAccount;
import com.godaddy.dashboard.repository.GoDaddyAccountRepository;
import com.godaddy.dashboard.service.DomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/domains")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DomainController {

    private final DomainService domainService;
    private final GoDaddyAccountRepository accountRepository;

    @GetMapping("/all")
    public ResponseEntity<List<DomainDto.Response>> getAllDomains(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(domainService.getAllDomains(search, accountId, status));
    }

    @GetMapping("/stats")
    public ResponseEntity<DomainDto.DashboardStats> getStats() {
        return ResponseEntity.ok(domainService.getStats());
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncAll() {
        int count = domainService.syncAllAccounts();
        return ResponseEntity.ok("Synced " + count + " domains");
    }

    @PostMapping("/sync/{accountId}")
    public ResponseEntity<String> syncAccount(@PathVariable String accountId) {
        GoDaddyAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));
        int count = domainService.syncSingleAccount(account);
        return ResponseEntity.ok("Synced " + count + " domains for account " + account.getAccountName());
    }

    @PatchMapping("/{id}/tag")
    public ResponseEntity<DomainDto.Response> updateTag(
            @PathVariable String id,
            @RequestBody DomainDto.TagUpdateRequest req) {
        return ResponseEntity.ok(domainService.updateTag(id, req.getClientTag()));
    }
}
