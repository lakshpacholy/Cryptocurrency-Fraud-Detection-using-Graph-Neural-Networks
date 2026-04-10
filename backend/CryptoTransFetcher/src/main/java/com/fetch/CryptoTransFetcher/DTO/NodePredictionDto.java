package com.fetch.CryptoTransFetcher.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class NodePredictionDto {
    private String address;
    private String label;         // "Fraud" / "Not Fraud"
    private double probability;   // 0.0–1.0

    // getters/setters
}

