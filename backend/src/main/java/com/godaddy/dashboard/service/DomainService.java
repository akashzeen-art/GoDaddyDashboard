package com.godaddy.dashboard.service;

import com.godaddy.dashboard.dto.DomainDto;
import com.godaddy.dashboard.entity.Domain;
import com.godaddy.dashboard.entity.GoDaddyAccount;
import com.godaddy.dashboard.repository.DomainRepository;
import com.godaddy.dashboard.repository.GoDaddyAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DomainService {

    private final DomainRepository domainRepository;
    private final GoDaddyAccountRepository accountRepository;
    private final GoDaddyApiService godaddyApiService;
    private final MongoTemplate mongoTemplate;

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_DATE_TIME;

    public int syncAllAccounts() {
        List<GoDaddyAccount> accounts = accountRepository.findByActiveTrue();
        int total = 0;
        for (GoDaddyAccount account : accounts) {
            total += syncSingleAccount(account);
        }
        return total;
    }

    public int syncSingleAccount(GoDaddyAccount account) {
        List<Map<String, Object>> raw = godaddyApiService.fetchDomainsForAccount(account);
        domainRepository.deleteByAccountId(account.getId());

        List<Domain> domains = raw.stream().map(d -> {
            Domain domain = new Domain();
            domain.setDomainName((String) d.get("domain"));
            domain.setAccountId(account.getId());
            domain.setStatus(computeStatus((String) d.get("expires")));
            domain.setExpiryDate(parseDate((String) d.get("expires")));
            domain.setLastFetchedAt(LocalDateTime.now());
            return domain;
        }).collect(Collectors.toList());

        domainRepository.saveAll(domains);
        account.setLastSyncedAt(LocalDateTime.now());
        accountRepository.save(account);
        log.info("Synced {} domains for account {}", domains.size(), account.getAccountName());
        return domains.size();
    }

    public List<DomainDto.Response> getAllDomains(String search, String accountId, String status) {
        return searchDomains(search, accountId, status).stream().map(this::toDto).collect(Collectors.toList());
    }

    public DomainDto.DashboardStats getStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in30Days = now.plusDays(30);

        List<Domain> expiring = domainRepository.findByExpiryDateBetween(now, in30Days);
        long total = domainRepository.count();
        long accounts = accountRepository.findByActiveTrue().size();
        long expired = searchDomains(null, null, "EXPIRED").size();

        DomainDto.DashboardStats stats = new DomainDto.DashboardStats();
        stats.setTotalDomains(total);
        stats.setExpiringSoon(expiring.size());
        stats.setTotalAccounts(accounts);
        stats.setExpiredDomains(expired);
        stats.setRecentExpiring(expiring.stream().limit(5).map(this::toDto).collect(Collectors.toList()));
        return stats;
    }

    public DomainDto.Response updateTag(String domainId, String tag) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new NoSuchElementException("Domain not found"));
        domain.setClientTag(tag);
        return toDto(domainRepository.save(domain));
    }

    private List<Domain> searchDomains(String search, String accountId, String status) {
        List<Criteria> criteria = new ArrayList<>();
        if (search != null && !search.isBlank()) {
            criteria.add(Criteria.where("domainName").regex(Pattern.quote(search), "i"));
        }
        if (accountId != null) {
            criteria.add(Criteria.where("accountId").is(accountId));
        }
        if (status != null) {
            criteria.add(Criteria.where("status").is(status));
        }

        Query query = new Query();
        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(Criteria[]::new)));
        }
        query.with(Sort.by(Sort.Direction.ASC, "expiryDate"));
        return mongoTemplate.find(query, Domain.class);
    }

    private DomainDto.Response toDto(Domain d) {
        DomainDto.Response r = new DomainDto.Response();
        r.setId(d.getId());
        r.setDomainName(d.getDomainName());
        r.setAccountId(d.getAccountId());
        accountRepository.findById(d.getAccountId())
                .ifPresentOrElse(
                        a -> r.setAccountName(a.getAccountName()),
                        () -> r.setAccountName("Unknown"));
        r.setExpiryDate(d.getExpiryDate());
        r.setStatus(d.getStatus());
        r.setClientTag(d.getClientTag());
        return r;
    }

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null) return null;
        try {
            return LocalDateTime.parse(dateStr.replace("Z", ""), ISO);
        } catch (Exception e) {
            return null;
        }
    }

    private String computeStatus(String expiryStr) {
        LocalDateTime expiry = parseDate(expiryStr);
        if (expiry == null) return "UNKNOWN";
        LocalDateTime now = LocalDateTime.now();
        if (expiry.isBefore(now)) return "EXPIRED";
        if (expiry.isBefore(now.plusDays(30))) return "EXPIRING";
        return "ACTIVE";
    }
}
