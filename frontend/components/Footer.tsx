
import React from 'react';
import { Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#020617] border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">ChainSentinel</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Advanced blockchain intelligence and forensic graph analysis. Tracing illicit flows across the decentralized web.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">API Reference</a></li>
              <li><a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors text-sm">Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Github size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors"><Mail size={20} /></a>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} ChainSentinel. Built for blockchain fraud analysis research.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
