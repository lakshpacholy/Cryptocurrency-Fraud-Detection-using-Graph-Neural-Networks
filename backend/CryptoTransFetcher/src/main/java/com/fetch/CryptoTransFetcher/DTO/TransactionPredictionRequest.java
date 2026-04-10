package com.fetch.CryptoTransFetcher.DTO;


import lombok.Setter;
import lombok.Getter;


@Getter
@Setter
public class TransactionPredictionRequest {
    private String fromAddress;
    private String toAddress;
    private int k_hops = 2;    // default

    public TransactionPredictionRequest() {}

    public TransactionPredictionRequest(String from, String to, int kHops) {
        this.fromAddress = from;
        this.toAddress = to;
        this.k_hops = kHops;
    }

    // getters/setters
}