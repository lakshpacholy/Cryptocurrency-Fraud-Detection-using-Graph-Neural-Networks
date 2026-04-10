package com.fetch.CryptoTransFetcher.DTO;



import lombok.Data;
import java.util.List;

@Data
public class EtherscanResponse {

    private String status;              // "1" or "0"
    private String message;             // "OK", "No transactions found", error text
    private List<EtherscanTransaction> result;
}
