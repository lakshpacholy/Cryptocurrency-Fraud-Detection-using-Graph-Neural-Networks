
import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, ShieldCheck, Activity, Info, X, BrainCircuit, History, Radar } from 'lucide-react';
import { fetchTransactionGraph } from '../services/graphService';
import { GraphResponse, GraphNode } from '../types';
import GraphViewer from '../components/GraphViewer';
import { GoogleGenAI } from '@google/genai';

const ExplorerPage: React.FC = () => {
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [recentTraces, setRecentTraces] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recent_traces');
    if (saved) setRecentTraces(JSON.parse(saved));
  }, []);

  const runAiAnalysis = async (graphData: GraphResponse) => {
    setAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a Senior Blockchain Forensic Analyst for ChainSentinel. 
      Analyze this graph for transaction ${graphData.transactionHash}. 
      System Risk Score: ${graphData.riskScore}/100.
      Entities Involved: ${JSON.stringify(graphData.nodes)}
      Path Topology: ${JSON.stringify(graphData.edges)}
      
      Analyze for:
      1. Money laundering cycles or mixers (like Tornado Cash proxies).
      2. Peel chains or layering behaviors.
      3. Proximity to high-risk clusters.
      
      Provide a highly technical, objective security briefing in exactly 3 concise sentences. Focus on topology and behavioral patterns.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 4000 } // Enable thinking for forensic reasoning
        }
      });
      setAiAnalysis(response.text || 'Analysis unavailable.');
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setAiAnalysis('Security briefing engine offline. Local heuristic score remains active.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTrace = async (targetHash: string) => {
    if (!targetHash.trim() || !targetHash.startsWith('0x')) {
      setError('Invalid hash format. Must be a valid 0x hex string.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setSelectedNode(null);
    setAiAnalysis('');

    try {
      const response = await fetchTransactionGraph(targetHash);
      setData(response);
      
      const updated = [targetHash, ...recentTraces.filter(h => h !== targetHash)].slice(0, 5);
      setRecentTraces(updated);
      localStorage.setItem('recent_traces', JSON.stringify(updated));

      runAiAnalysis(response);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLabel = (score: number) => {
    if (score > 70) return { label: 'CRITICAL_THREAT', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
    if (score > 40) return { label: 'SUSPICIOUS_FLOW', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    return { label: 'VERIFIED_CLEAR', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
  };

  return (
    <div className="pt-24 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10">
          <div className="text-center mb-12">
             <div className="flex items-center justify-center space-x-3 mb-4">
                <Radar className="text-cyan-400 animate-pulse" size={32} />
                <h1 className="text-4xl font-extrabold text-white tracking-tight italic">FORENSIC_LENS</h1>
             </div>
            <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">Deep Chain Analysis & Behavioral Fingerprinting</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start max-w-5xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleTrace(txHash); }} className="flex-grow relative group w-full shadow-2xl">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-cyan-500/50">
                <Search size={22} />
              </div>
              <input 
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="TX_HASH_INPUT (0x...)"
                className="w-full pl-14 pr-36 py-5 bg-[#050816] border-2 border-slate-800 rounded-2xl focus:outline-none focus:border-cyan-500/50 transition-all font-mono text-sm tracking-wider text-cyan-50"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute inset-y-2.5 right-2.5 px-8 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black rounded-xl transition-all disabled:opacity-50 uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'INIT_TRACE'}
              </button>
            </form>

            {recentTraces.length > 0 && (
              <div className="w-full md:w-64 flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase font-black tracking-widest px-1">
                  <History size={12} className="text-slate-600" />
                  <span>LOGS</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {recentTraces.map((h, i) => (
                    <button 
                      key={i}
                      onClick={() => { setTxHash(h); handleTrace(h); }}
                      className="px-3 py-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 transition-all text-left truncate group"
                    >
                      <span className="text-cyan-500/40 mr-2">#{i+1}</span>
                      <span className="group-hover:text-cyan-300">{h}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-mono flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} />
              <span>[ERR] {error}</span>
            </div>
          )}
        </div>

        {data ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-4 flex flex-col space-y-6">
              
              <div className="p-8 rounded-3xl bg-[#0a0f1d] border border-slate-800 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={120} />
                 </div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                    <Activity size={16} className="text-cyan-400" />
                    <span>Risk_Metrics</span>
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-widest ${getRiskLabel(data.riskScore).border} ${getRiskLabel(data.riskScore).bg} ${getRiskLabel(data.riskScore).color}`}>
                    {getRiskLabel(data.riskScore).label}
                  </div>
                </div>
                
                <div className="flex items-baseline space-x-3 mb-8">
                  <span className={`text-7xl font-black font-mono tracking-tighter ${getRiskLabel(data.riskScore).color}`}>{data.riskScore}</span>
                  <span className="text-slate-600 text-2xl font-mono">/100</span>
                </div>
                
                <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden mb-8">
                  <div 
                    className={`h-full transition-all duration-1500 ease-out ${
                      data.riskScore > 70 ? 'bg-red-500' : data.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${data.riskScore}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Entities</div>
                    <div className="text-2xl font-black text-white font-mono">{data.nodes.length}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Hops</div>
                    <div className="text-2xl font-black text-white font-mono">{data.edges.length}</div>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#0a0f1d] border border-cyan-500/10 shadow-[0_0_50px_rgba(34,211,238,0.03)] border-t-cyan-500/30">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-cyan-400 flex items-center space-x-3 tracking-[0.2em]">
                    <BrainCircuit size={18} />
                    <span>AI_FORENSIC_ENGINE</span>
                  </h3>
                  {analyzing && <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>}
                </div>
                
                <div className="min-h-[140px] text-xs leading-relaxed text-slate-300 font-mono relative">
                  {analyzing ? (
                    <div className="space-y-3">
                      <div className="h-2 bg-slate-800/50 rounded w-full animate-pulse"></div>
                      <div className="h-2 bg-slate-800/50 rounded w-5/6 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="h-2 bg-slate-800/50 rounded w-4/6 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <div className="h-2 bg-slate-800/50 rounded w-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                    </div>
                  ) : (
                    <div className="relative">
                       <span className="absolute -left-4 top-0 text-cyan-900 text-4xl leading-none">"</span>
                       <p className="italic text-slate-400 pl-2 leading-relaxed selection:bg-cyan-500/20">
                        {aiAnalysis || 'System ready. Waiting for blockchain ingress...'}
                       </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedNode && (
                <div className="p-8 rounded-3xl bg-[#0a0f1d] border-2 border-slate-800 animate-in zoom-in-95 duration-200">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Entity_Properties</h3>
                    <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-2">Identification</div>
                      <div className="text-[11px] font-mono text-cyan-400 break-all bg-black/40 p-4 rounded-xl border border-slate-800/50 leading-relaxed shadow-inner">
                        {selectedNode.id}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Entity_Type</div>
                        <div className="text-xs text-white capitalize font-black bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">{selectedNode.type}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Individual_Risk</div>
                        <div className={`text-xl font-black font-mono ${selectedNode.risk > 70 ? 'text-red-500' : 'text-slate-300'}`}>
                          {selectedNode.risk}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 flex flex-col space-y-4 h-full min-h-[700px]">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center space-x-3 text-[10px] text-slate-600 uppercase font-black tracking-[0.3em]">
                  <Info size={14} className="text-cyan-500/50" />
                  <span>Interaction: Drag/Scroll/Focus</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-500/40 px-3 py-1 bg-slate-900/50 rounded-full border border-slate-800">
                  SESSION_ID: {data.transactionHash.substring(2, 14).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 rounded-[2.5rem] overflow-hidden border-2 border-slate-800 bg-[#020617] shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                <GraphViewer data={data} onNodeClick={(node) => setSelectedNode(node)} />
              </div>
            </div>
          </div>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-40 text-slate-600 border-2 border-dashed border-slate-800/40 rounded-[3rem] bg-slate-900/5 group hover:border-cyan-500/20 transition-all duration-700">
            <ShieldCheck size={100} className="mb-8 opacity-5 group-hover:opacity-10 transition-opacity" />
            <h3 className="text-2xl font-black text-slate-400 mb-2 uppercase tracking-widest">Awaiting Command</h3>
            <p className="text-sm max-w-sm text-center opacity-40 font-mono tracking-tight leading-relaxed">
              Input a transaction hash above to begin multi-hop entity traversal and risk mapping.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-48">
            <div className="relative">
               <Loader2 size={80} className="text-cyan-400 animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-cyan-400/10 rounded-full animate-ping"></div>
               </div>
            </div>
            <div className="mt-12 text-center">
              <p className="text-cyan-400 font-mono text-sm font-black tracking-[0.4em] uppercase mb-2">Traversing_Chain_State</p>
              <p className="text-slate-600 text-[10px] font-mono tracking-widest opacity-60">FETCHING_UTXO_SETS ... 64%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorerPage;
