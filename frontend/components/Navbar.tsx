
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutGrid, Home, Activity, Database } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050816]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-500 ${pulse ? 'animate-ping' : ''}`}></div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tight">
              ChainSentinel
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
             <div className="flex items-center space-x-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                <Activity size={12} className="text-green-500" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Nodes: Online</span>
             </div>

            <div className="flex space-x-1">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === '/' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Home size={16} />
                <span>Home</span>
              </Link>
              <Link 
                to="/explorer" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === '/explorer' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutGrid size={16} />
                <span>Explorer</span>
              </Link>
              <Link 
                to="/transactions" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location.pathname === '/transactions' ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Database size={16} />
                <span>Transactions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
