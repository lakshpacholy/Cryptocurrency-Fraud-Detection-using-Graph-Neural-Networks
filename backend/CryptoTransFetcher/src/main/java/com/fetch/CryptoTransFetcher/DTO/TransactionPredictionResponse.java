package com.fetch.CryptoTransFetcher.DTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TransactionPredictionResponse {
    private NodePredictionDto from;
    private NodePredictionDto to;
    private TransactionPredictionDto transaction;
    private TraceGraphDto traceGraph;

    // getters/setters
}

