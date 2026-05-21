package com.godaddy.dashboard.controller;

import com.godaddy.dashboard.dto.AccountDto;
import com.godaddy.dashboard.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountDto.Response> addAccount(@RequestBody AccountDto.CreateRequest req) {
        return ResponseEntity.ok(accountService.addAccount(req));
    }

    @GetMapping
    public ResponseEntity<List<AccountDto.Response>> getAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable String id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}
