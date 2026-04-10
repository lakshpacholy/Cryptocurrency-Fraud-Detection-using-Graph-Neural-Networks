package com.fetch.CryptoTransFetcher.DTO;

import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class TraceGraphDto {
    private int numNodes;
    private int numEdges;
    private List<Map<String, Object>> nodes;
    private List<Map<String, Object>> edges;

    // getters/setters
}
