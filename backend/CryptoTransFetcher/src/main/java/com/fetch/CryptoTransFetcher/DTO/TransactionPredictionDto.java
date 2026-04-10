package com.fetch.CryptoTransFetcher.DTO;



import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TransactionPredictionDto {
    private String label;         // "Fraud" / "Not Fraud"
    private double probability;
    private String centerAddress;

    // getters/setters
}