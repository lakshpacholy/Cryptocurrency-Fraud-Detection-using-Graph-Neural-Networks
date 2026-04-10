
import { GraphResponse, GraphEdge, GraphNode, PredictionResponse, NodeRole } from '../types';

const normalizeNode = (node: Record<string, any>, role?: NodeRole): GraphNode => ({
  id: String(node.id ?? node.address ?? node.label ?? 'unknown'),
  label: String(node.label ?? node.address ?? node.id ?? 'Unknown'),
  type: role ? 'wallet' : (node.type === 'wallet' || node.type === 'transaction' ? node.type : node.address ? 'wallet' : 'transaction'),
  risk: typeof node.risk === 'number'
    ? node.risk
    : typeof node.probability === 'number'
      ? Math.round(node.probability * 100)
      : 0,
  role: role ?? null,
});

const normalizeEdge = (edge: Record<string, any>): GraphEdge => ({
  source: String(edge.source?.id ?? edge.source ?? edge.from ?? edge.fromAddress ?? ''),
  target: String(edge.target?.id ?? edge.target ?? edge.to ?? edge.toAddress ?? ''),
  label: String(edge.label ?? edge.relation ?? ''),
});

const normalizePredictionResponse = (payload: PredictionResponse, txHash: string): GraphResponse => {
  const fromAddr = String(payload.from?.address ?? '').toLowerCase();
  const toAddr = String(payload.to?.address ?? '').toLowerCase();
  const centreAddr = String(payload.transaction?.centerAddress ?? '').toLowerCase();

  const rawNodes: Record<string, any>[] = Array.isArray(payload.traceGraph?.nodes)
    ? payload.traceGraph.nodes
    : [];

  // Try to match a raw node against an address by checking all possible fields
  const matchesAddress = (n: Record<string, any>, addr: string): boolean => {
    if (!addr) return false;
    const candidates = [n.id, n.address, n.label].map(v => String(v ?? '').toLowerCase());
    return candidates.some(c => c === addr || c.includes(addr) || addr.includes(c));
  };

  // Find which raw node index matches each role
  const centreIdx = rawNodes.findIndex(n => matchesAddress(n, centreAddr));
  const fromIdx = rawNodes.findIndex(n => matchesAddress(n, fromAddr));
  const toIdx = rawNodes.findIndex(n => matchesAddress(n, toAddr));

  // If centre not found by address, fall back to the most-connected node
  const rawEdges: Record<string, any>[] = Array.isArray(payload.traceGraph?.edges)
    ? payload.traceGraph.edges
    : [];

  const degreeMap = new Map<string, number>();
  rawEdges.forEach(e => {
    const s = String(e.source?.id ?? e.source ?? e.from ?? '');
    const t = String(e.target?.id ?? e.target ?? e.to ?? '');
    degreeMap.set(s, (degreeMap.get(s) ?? 0) + 1);
    degreeMap.set(t, (degreeMap.get(t) ?? 0) + 1);
  });

  const effectiveCentreIdx = centreIdx !== -1 ? centreIdx : (() => {
    let maxDeg = -1, maxIdx = 0;
    rawNodes.forEach((n, i) => {
      const nid = String(n.id ?? n.address ?? n.label ?? '');
      const deg = degreeMap.get(nid) ?? 0;
      if (deg > maxDeg) { maxDeg = deg; maxIdx = i; }
    });
    return maxIdx;
  })();

  const nodes: GraphNode[] = rawNodes.map((n, i) => {
    const role: NodeRole =
      i === effectiveCentreIdx ? 'centre' :
      i === fromIdx ? 'from' :
      i === toIdx ? 'to' : null;
    return normalizeNode(n, role ?? undefined);
  });

  // Build ID map for edge remapping
  const idMap = new Map<string, string>();
  nodes.forEach(n => idMap.set(n.id.toLowerCase(), n.id));

  const edges = rawEdges.map((e: Record<string, any>) => {
    const raw = normalizeEdge(e);
    return {
      ...raw,
      source: idMap.get(raw.source.toLowerCase()) ?? raw.source,
      target: idMap.get(raw.target.toLowerCase()) ?? raw.target,
    };
  });

  return {
    transactionHash: txHash,
    riskScore: payload.transaction?.probability ? Math.round(payload.transaction.probability * 100) : 0,
    nodes,
    edges,
  };
};

/**
 * Fetches the AI-generated graph for a transaction hash from the backend.
 * The backend proxies to the ML model service.
 */
export const fetchTransactionGraph = async (txHash: string): Promise<GraphResponse> => {
  const response = await fetch(`/api/transactions/predict?hash=${encodeURIComponent(txHash)}&kHops=2`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  const payload = await response.json();

  if (payload && Array.isArray(payload.nodes) && Array.isArray(payload.edges)) {
    return {
      transactionHash: txHash,
      riskScore: typeof payload.riskScore === 'number' ? payload.riskScore : 0,
      nodes: payload.nodes.map(normalizeNode),
      edges: payload.edges.map(normalizeEdge),
    };
  }

  if (payload && payload.traceGraph) {
    return normalizePredictionResponse(payload as PredictionResponse, txHash);
  }

  throw new Error('Unexpected graph payload format from prediction endpoint.');
};
