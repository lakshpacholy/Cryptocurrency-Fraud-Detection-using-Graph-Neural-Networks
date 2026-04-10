
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldAlert, BarChart3, Fingerprint, Zap } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-400/50 transition-all group hover:-translate-y-1">
    <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">
      {description}
    </p>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative pt-16">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-semibold mb-8">
          <Zap size={14} className="animate-pulse" />
          <span>REAL-TIME ANALYSIS ENABLED</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Visualize and trace <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-lime-400">
            suspicious crypto flows
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10">
          ChainSentinel provides high-fidelity graph analytics for blockchain security teams. Trace laundering paths, identify mixers, and score wallet risks in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => navigate('/explorer')}
            className="px-8 py-4 rounded-full bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-all flex items-center space-x-2 shadow-[0_0_20px_rgba(34,211,238,0.4)] group"
          >
            <span>Launch Graph Explorer</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold border border-slate-800 hover:bg-slate-800 transition-all">
            Learn more
          </button>
        </div>

        {/* Floating Preview Card (Static Mock) */}
        <div className="mt-20 relative max-w-4xl mx-auto p-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur shadow-2xl animate-float">
          <div className="bg-[#050816] rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-800">
            <div className="text-slate-700 font-mono text-sm opacity-50 flex flex-col items-center">
              <ShieldAlert size={48} className="mb-4 text-cyan-500/20" />
              <p>[ GRAPH_PREVIEW_REDACTED ]</p>
              <p>SECURE_SESSION_ACTIVE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-950 py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Forensic Capabilities</h2>
            <p className="text-slate-400">Everything you need to conduct deep blockchain investigations.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<BarChart3 />}
              title="Transaction Tracing"
              description="Real-time recursive tracing of transactions across hundreds of hops."
            />
            <FeatureCard 
              icon={<ShieldAlert />}
              title="Anomaly Detection"
              description="Identify washing patterns, peel chains, and dusting attacks automatically."
            />
            <FeatureCard 
              icon={<Fingerprint />}
              title="Wallet Profiling"
              description="De-anonymize wallet clusters using behavioral heuristics and known labels."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Risk Scoring"
              description="Instant ML-driven risk scores from 0-100 based on connectivity to bad actors."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white mb-16">How it works</h2>
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Horizontal line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px bg-slate-800"></div>
            
            <div className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 font-bold text-2xl z-10 mb-6 shadow-[0_0_15px_rgba(34,211,238,0.3)]">1</div>
              <h3 className="text-lg font-bold text-white mb-2">Input Hash</h3>
              <p className="text-slate-400 text-sm">Provide any EVM-compatible transaction hash or wallet address.</p>
            </div>
            <div className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center text-purple-500 font-bold text-2xl z-10 mb-6 shadow-[0_0_15px_rgba(168,85,247,0.3)]">2</div>
              <h3 className="text-lg font-bold text-white mb-2">ML Analysis</h3>
              <p className="text-slate-400 text-sm">Our backend traverses the ledger and calculates risk scores.</p>
            </div>
            <div className="flex flex-col items-center text-center relative">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-lime-400 flex items-center justify-center text-lime-400 font-bold text-2xl z-10 mb-6 shadow-[0_0_15px_rgba(163,230,53,0.3)]">3</div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Exploration</h3>
              <p className="text-slate-400 text-sm">Interact with the generated graph to follow the money paths.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
