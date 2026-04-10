package com.fetch.CryptoTransFetcher.Controller;

import java.util.List;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fetch.CryptoTransFetcher.DTO.TransactionPredictionResponse;
import com.fetch.CryptoTransFetcher.Model.Transaction;
import com.fetch.CryptoTransFetcher.Service.TransactionService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private static final Logger logger = LoggerFactory.getLogger(TransactionController.class);

    @Autowired
    private TransactionService transactionService;

    @Value("${etherscan.api.key}")
    private String apiKey;

    @GetMapping
    public List<Transaction> getAllTransactions() {
        logger.info("GET all transactions requested");
        return transactionService.getAllTransactions();
    }

    @PostMapping("/save")
    public void saveTransactions(@RequestBody List<Transaction> transactions) {
        logger.info("Saving {} transactions", transactions.size());
        transactionService.saveTransactions(transactions);
    }

    @PostMapping("/fetch")
    public String fetchAndStoreTransactions(
            @RequestParam String address,
            @RequestParam(defaultValue = "sepolia") String network) {

        logger.info("Fetching and storing transactions for address: {} on network: {}",
                    address, network);

        boolean ok = transactionService.fetchAndStoreTransactions(address, apiKey, network);
        return ok ? "Data fetched and stored successfully!" : "Cannot be fetched";
    }


    @GetMapping("/predict")
    public TransactionPredictionResponse predictForTx(
            @RequestParam String hash,
            @RequestParam(defaultValue = "2") int kHops) {
        return transactionService.predictForHash(hash, kHops);
    }

}