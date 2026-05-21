package com.godaddy.dashboard.repository;

import com.godaddy.dashboard.entity.Domain;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface DomainRepository extends MongoRepository<Domain, String> {

    void deleteByAccountId(String accountId);

    long countByAccountId(String accountId);

    List<Domain> findByExpiryDateBetween(LocalDateTime start, LocalDateTime end);
}
