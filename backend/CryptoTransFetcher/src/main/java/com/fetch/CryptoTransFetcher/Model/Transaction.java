package com.fetch.CryptoTransFetcher.Model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "transactions")
@AllArgsConstructor
@NoArgsConstructor

@Data
public class Transaction {
    @Id
    private String id;

    private String hash;
    private String from;
    private String to;
    private String value;          // keep raw wei string; convert in UI/analytics
    private long timeStamp;        // epoch seconds
    private long blockNumber;

    private String gas;
    private String gasPrice;

    private String isError;        // "0"/"1" from API
    private String txreceiptStatus;

    private String contractAddress; // may be ""
    private String methodId;        // "0x..." or "0x" for simple transfer
    
}
