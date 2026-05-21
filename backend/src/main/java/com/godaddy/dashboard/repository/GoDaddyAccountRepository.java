package com.godaddy.dashboard.repository;

import com.godaddy.dashboard.entity.GoDaddyAccount;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GoDaddyAccountRepository extends MongoRepository<GoDaddyAccount, String> {
    List<GoDaddyAccount> findByActiveTrue();
}
