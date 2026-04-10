package com.fetch.CryptoTransFetcher.Repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.fetch.CryptoTransFetcher.Model.Transaction;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    boolean existsByHash(String hash);
    Optional<Transaction> findByHash(String hash);
}
