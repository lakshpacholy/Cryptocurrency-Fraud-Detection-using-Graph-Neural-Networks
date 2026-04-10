
export type NodeType = 'wallet' | 'transaction';

export type NodeRole = 'from' | 'to' | 'centre' | null;

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  risk: number; // 0 - 100
  role?: NodeRole; // special wallet roles
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface GraphResponse {
  transactionHash: string;
  riskScore: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RiskThresholds {
  low: number;
  medium: number;
}

// --- Transaction API types ---

export interface Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: number;
  blockNumber: number;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceiptStatus: string;
  contractAddress: string;
  methodId: string;
}

export interface NodePrediction {
  address: string;
  label: string;       // "Fraud" | "Not Fraud"
  probability: number; // 0.0 - 1.0
}

export interface TransactionPrediction {
  label: string;
  probability: number;
  centerAddress: string;
}

export interface TraceGraph {
  numNodes: number;
  numEdges: number;
  nodes: Record<string, any>[];
  edges: Record<string, any>[];
}

export interface PredictionResponse {
  from: NodePrediction;
  to: NodePrediction;
  transaction: TransactionPrediction;
  traceGraph: TraceGraph;
}
