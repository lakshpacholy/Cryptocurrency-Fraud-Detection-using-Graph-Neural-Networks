package com.fetch.CryptoTransFetcher.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import com.fetch.CryptoTransFetcher.DTO.EtherscanResponse;
import com.fetch.CryptoTransFetcher.DTO.TransactionPredictionRequest;
import com.fetch.CryptoTransFetcher.DTO.TransactionPredictionResponse;
import com.fetch.CryptoTransFetcher.Model.Transaction;
import com.fetch.CryptoTransFetcher.Repository.TransactionRepository;

@Service
public class TransactionService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionService.class);

    @Value("${model.service.url}")
    private String modelServiceUrl;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public void saveTransactions(List<Transaction> transactions) {
        transactionRepository.saveAll(transactions);
    }

    public boolean fetchAndStoreTransactions(String address, String apiKey, String network) {

        // normalize network string
        String net = network == null ? "" : network.trim().toLowerCase();

        String chainId;
        switch (net) {
            case "sepolia":
                chainId = "11155111";
                break;
            case "ethereum":
            case "mainnet":
                chainId = "1";
                break;
            default:
                logger.warn("Unknown network '{}', defaulting to mainnet", network);
                chainId = "1";
        }

        String apiUrl =
                "https://api.etherscan.io/v2/api"
            + "?chainid=" + chainId
            + "&module=account"
            + "&action=txlist"
            + "&address=" + address
            + "&startblock=0"
            + "&endblock=99999999"
            + "&sort=asc"
            + "&apikey=" + apiKey;

        try {
            EtherscanResponse response =
                    restTemplate.getForObject(apiUrl, EtherscanResponse.class);

            if (response == null || !"1".equals(response.getStatus())) {
                logger.warn("Etherscan returned status={} message={} for network={}",
                        response != null ? response.getStatus() : "null",
                        response != null ? response.getMessage() : "null",
                        network);
                return false;
            }

            List<Transaction> txs = response.getResult().stream()
                    .filter(apiTx -> !transactionRepository.existsByHash(apiTx.getHash()))
                    .map(apiTx -> {
                        Transaction tx = new Transaction();
                        tx.setHash(apiTx.getHash());
                        tx.setFrom(apiTx.getFrom());
                        tx.setTo(apiTx.getTo());
                        tx.setValue(apiTx.getValue());
                        tx.setTimeStamp(Long.parseLong(apiTx.getTimeStamp()));
                        tx.setBlockNumber(Long.parseLong(apiTx.getBlockNumber()));
                        tx.setGas(apiTx.getGas());
                        tx.setGasPrice(apiTx.getGasPrice());
                        tx.setIsError(apiTx.getIsError());
                        tx.setTxreceiptStatus(apiTx.getTxreceipt_status());
                        tx.setContractAddress(apiTx.getContractAddress());
                        tx.setMethodId(apiTx.getMethodId());
                        return tx;
                    })
                    .collect(Collectors.toList());

            if (!txs.isEmpty()) {
                transactionRepository.saveAll(txs);
            }
            logger.info("Saved {} transactions for {} on {}", txs.size(), address, network);
            return true;

        } catch (Exception e) {
            logger.error("Error fetching/storing transactions for {} on {}", address, network, e);
            return false;
        }
    }


        
    public TransactionPredictionResponse predictForTransaction(String from, String to, int kHops) {
        TransactionPredictionRequest req = new TransactionPredictionRequest(from, to, kHops);
        String url = modelServiceUrl + "/predict/transaction";
        return restTemplate.postForObject(url, req, TransactionPredictionResponse.class);
    }

    public TransactionPredictionResponse predictForHash(String txHash, int kHops) {
        Transaction tx = transactionRepository.findByHash(txHash)
            .orElseThrow(() -> new IllegalArgumentException("Tx not found: " + txHash));
        return predictForTransaction(tx.getFrom(), tx.getTo(), kHops);
    }
    

}

