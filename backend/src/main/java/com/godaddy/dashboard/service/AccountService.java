package com.godaddy.dashboard.service;

import com.godaddy.dashboard.dto.AccountDto;
import com.godaddy.dashboard.entity.GoDaddyAccount;
import com.godaddy.dashboard.repository.DomainRepository;
import com.godaddy.dashboard.repository.GoDaddyAccountRepository;
import com.godaddy.dashboard.security.AesEncryptor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final GoDaddyAccountRepository accountRepository;
    private final DomainRepository domainRepository;
    private final AesEncryptor aesEncryptor;

    public AccountDto.Response addAccount(AccountDto.CreateRequest req) {
        GoDaddyAccount account = new GoDaddyAccount();
        account.setAccountName(req.getAccountName());
        account.setEncryptedApiKey(aesEncryptor.encrypt(req.getApiKey()));
        account.setEncryptedApiSecret(aesEncryptor.encrypt(req.getApiSecret()));
        return toDto(accountRepository.save(account));
    }

    public List<AccountDto.Response> getAllAccounts() {
        return accountRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public void deleteAccount(String id) {
        domainRepository.deleteByAccountId(id);
        accountRepository.deleteById(id);
    }

    private AccountDto.Response toDto(GoDaddyAccount a) {
        AccountDto.Response r = new AccountDto.Response();
        r.setId(a.getId());
        r.setAccountName(a.getAccountName());
        r.setLastSyncedAt(a.getLastSyncedAt());
        r.setActive(a.isActive());
        r.setDomainCount((int) domainRepository.countByAccountId(a.getId()));
        return r;
    }
}
