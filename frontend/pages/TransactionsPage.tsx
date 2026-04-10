import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Loader2, AlertCircle, RefreshCw, Download,
  ChevronRight, ShieldAlert, ShieldCheck, Activity, Database
} from 'lucide-react';
import { Transaction, PredictionResponse } from '../types';
import { getAllTransactions, fetchAndStoreTransactions, predictTransaction } from '../services/transactionService';

const NETWORKS = ['sepolia', 'ethereum'];

const RiskBadge: React.FC<{ label: string; probability: number }> = ({ label, probability }) => {
  const isFraud = label === 'Fraud';
  const pct = Math.round(probability * 100);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest border ${
      isFraud
        ? 'bg-red-500/10 border-red-500/30 text-red-400'
        : 'bg-green-500/10 border-green-500/30 text-green-400'
    }`}>
      {isFraud ? <ShieldAlert size={10} /> : <ShieldCheck size={10} />}
      {label} {pct}%
    </span>
  );
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch form state
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('sepolia');
  const [fetching, setFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState<string | null>(null);

  // Prediction state
  const [predicting, setPredicting] = useState<string | null>(null); // hash being predicted
  const [predictions, setPredictions] = useState<Record<string, PredictionResponse>>({});
  const [expandedHash, setExpandedHash] = useState<string | null>(null);

  // Search/filter
  const [search, setSearch] = useState('');

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    setFetching(true);
    setFetchMsg(null);
    setError(null);
    try {
      const msg = await fetchAndStoreTransactions(address.trim(), network);
      setFetchMsg(msg);
      await loadTransactions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetching(false);
    }
  };

  const handlePredict = async (hash: string) => {
    setPredicting(hash);
    try {
      const result = await predictTransaction(hash);
      setPredictions(prev => ({ ...prev, [hash]: result }));
      setExpandedHash(hash);
    } catch (e: any) {
      setError(`Prediction failed for ${hash.substring(0, 10)}...: ${e.message}`);
    } finally {
      setPredicting(null);
    }
  };

  const filtered = transactions.filter(tx =>
    !search ||
    tx.hash.toLowerCase().includes(search.toLowerCase()) ||
    tx.from.toLowerCase().includes(search.toLowerCase()) ||
    tx.to?.toLowerCase().includes(search.toLowerCase())
  );

  const formatValue = (wei: string) => {
    try {
      const eth = parseFloat(wei) / 1e18;
      return eth.toFixed(6) + ' ETH';
    } catch { return wei; }
  };

  const formatTime = (ts: number) =>
    new Date(ts * 1000).toLocaleString();

  const shortAddr = (addr: string) =>
    addr ? `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}` : '—';

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Database className="text-cyan-400" size={32} />
            <h1 className="text-4xl font-extrabold text-white tracking-tight italic">TX_LEDGER</h1>
          </div>
          <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">
            Fetch, Browse & Analyze On-Chain Transactions
          </p>
        </div>

        {/* Fetch Form */}
        <div className="mb-8 p-6 rounded-2xl bg-[#0a0f1d] border border-slate-800">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Download size={14} className="text-cyan-400" />
            Ingest Wallet Transactions
          </h2>
          <form onSubmit={handleFetch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Wallet address (0x...)"
              className="flex-1 px-4 py-3 bg-[#050816] border border-slate-800 rounded-xl font-mono text-sm text-cyan-50 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            <select
              value={network}
              onChange={e => setNetwork(e.target.value)}
              className="px-4 py-3 bg-[#050816] border border-slate-800 rounded-xl font-mono text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-all"
            >
              {NETWORKS.map(n => (
                <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={fetching || !address.trim()}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl transition-all disabled:opacity-50 text-xs tracking-widest uppercase flex items-center gap-2"
            >
              {fetching ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {fetching ? 'Fetching...' : 'Fetch & Store'}
            </button>
          </form>
          {fetchMsg && (
            <p className="mt-3 text-xs font-mono text-green-400 flex items-center gap-2">
              <ShieldCheck size={14} /> {fetchMsg}
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono flex items-center gap-3">
            <AlertCircle size={18} />
            [ERR] {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="rounded-2xl bg-[#0a0f1d] border border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-cyan-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Transactions
              </span>
              <span className="px-2 py-0.5 bg-slate-800 rounded-full text-[10px] font-mono text-slate-400">
                {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search hash / address..."
                  className="pl-8 pr-4 py-2 bg-[#050816] border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50 w-56 transition-all"
                />
              </div>
              <button
                onClick={loadTransactions}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={40} className="text-cyan-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600">
              <Database size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-mono">No transactions found. Fetch a wallet above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest">
                    <th className="text-left px-5 py-3">Hash</th>
                    <th className="text-left px-5 py-3">From</th>
                    <th className="text-left px-5 py-3">To</th>
                    <th className="text-left px-5 py-3">Value</th>
                    <th className="text-left px-5 py-3">Time</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Prediction</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => {
                    const pred = predictions[tx.hash];
                    const isExpanded = expandedHash === tx.hash;
                    return (
                      <React.Fragment key={tx.hash}>
                        <tr
                          className={`border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-800/30' : ''}`}
                          onClick={() => setExpandedHash(isExpanded ? null : tx.hash)}
                        >
                          <td className="px-5 py-3 text-cyan-400">
                            {shortAddr(tx.hash)}
                          </td>
                          <td className="px-5 py-3 text-slate-400">{shortAddr(tx.from)}</td>
                          <td className="px-5 py-3 text-slate-400">{shortAddr(tx.to)}</td>
                          <td className="px-5 py-3 text-slate-300">{formatValue(tx.value)}</td>
                          <td className="px-5 py-3 text-slate-500">{formatTime(tx.timeStamp)}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              tx.isError === '0'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}>
                              {tx.isError === '0' ? 'OK' : 'ERR'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            {pred ? (
                              <RiskBadge label={pred.transaction.label} probability={pred.transaction.probability} />
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); handlePredict(tx.hash); }}
                                disabled={predicting === tx.hash}
                                className="px-3 py-1.5 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-500/20 text-cyan-400 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all disabled:opacity-50 flex items-center gap-1"
                              >
                                {predicting === tx.hash
                                  ? <Loader2 size={10} className="animate-spin" />
                                  : <Activity size={10} />}
                                Analyze
                              </button>
                              <ChevronRight
                                size={14}
                                className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              />
                            </div>
                          </td>
                        </tr>

                        {/* Expanded prediction detail */}
                        {isExpanded && pred && (
                          <tr className="border-b border-slate-800/50 bg-slate-900/30">
                            <td colSpan={8} className="px-5 py-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* From node */}
                                <div className="p-4 rounded-xl bg-[#050816] border border-slate-800">
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">From Node</div>
                                  <div className="text-[11px] text-cyan-400 break-all mb-2">{pred.from.address}</div>
                                  <RiskBadge label={pred.from.label} probability={pred.from.probability} />
                                </div>
                                {/* Transaction */}
                                <div className="p-4 rounded-xl bg-[#050816] border border-slate-800">
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Transaction</div>
                                  <RiskBadge label={pred.transaction.label} probability={pred.transaction.probability} />
                                  <div className="mt-2 text-[10px] text-slate-500">
                                    Graph: {pred.traceGraph?.numNodes ?? '—'} nodes / {pred.traceGraph?.numEdges ?? '—'} edges
                                  </div>
                                </div>
                                {/* To node */}
                                <div className="p-4 rounded-xl bg-[#050816] border border-slate-800">
                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">To Node</div>
                                  <div className="text-[11px] text-cyan-400 break-all mb-2">{pred.to.address}</div>
                                  <RiskBadge label={pred.to.label} probability={pred.to.probability} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
