
import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize, ZoomIn, ZoomOut, Target } from 'lucide-react';
import { GraphResponse, GraphNode } from '../types';

interface GraphViewerProps {
  data: GraphResponse;
  onNodeClick: (node: GraphNode) => void;
}

const GraphViewer: React.FC<GraphViewerProps> = ({ data, onNodeClick }) => {
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const updateHighlight = useCallback((node: any) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());

    if (node) {
      const neighbors = new Set();
      const links = new Set();
      
      data.edges.forEach(link => {
        if (link.source === node.id || link.target === node.id) {
          links.add(link);
          neighbors.add(link.source);
          neighbors.add(link.target);
        }
      });

      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    }
  }, [data]);

  const handleNodeClick = (node: any) => {
    updateHighlight(node);
    onNodeClick(node as GraphNode);
    if (fgRef.current && node.x != null && node.y != null) {
      fgRef.current.centerAt(node.x, node.y, 400);
    }
  };

  const handleZoom = (factor: number) => {
    const currentZoom = fgRef.current.zoom();
    fgRef.current.zoom(currentZoom * factor, 400);
  };

  const handleReset = () => {
    fgRef.current.zoomToFit(400, 50);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  };

  // Format data for react-force-graph
  const graphData = {
    nodes: data.nodes.map(n => ({
      ...n,
      id: String(n.id ?? n.label ?? 'unknown'),
      label: String(n.label ?? n.id ?? ''),
      color: n.role === 'centre' ? '#f59e0b' : n.role === 'from' ? '#22d3ee' : n.role === 'to' ? '#34d399' : n.type === 'wallet' ? '#22d3ee' : '#a855f7',
      val: Math.max(10, Number.isFinite(Number(n.risk)) ? Number(n.risk) / 3 : 10)
    })),
    links: data.edges.map(link => ({
      ...link,
      source: String((link as any).source ?? ''),
      target: String((link as any).target ?? ''),
    }))
  };

  useEffect(() => {
    if (!fgRef.current) return;
    fgRef.current.d3Force('link').distance(150);
    fgRef.current.d3Force('charge').strength(-500);
    // Wait for simulation to settle before fitting
    setTimeout(() => {
      if (fgRef.current) fgRef.current.zoomToFit(400, 50);
    }, 1500);
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#020617] rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl group/canvas">
      {/* Legend Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col space-y-2">
        <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Wallet</span>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Tx_Node</span>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">Centre</span>
        </div>
        <div className="flex items-center space-x-3 px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl">
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span className="text-[10px] font-black text-slate-300 tracking-widest uppercase">To Wallet</span>
        </div>
      </div>

      {/* Control Overlay */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col space-y-2 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
        <button onClick={() => handleZoom(1.2)} className="p-3 bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white rounded-xl shadow-xl transition-all">
          <ZoomIn size={18} />
        </button>
        <button onClick={() => handleZoom(0.8)} className="p-3 bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white rounded-xl shadow-xl transition-all">
          <ZoomOut size={18} />
        </button>
        <button onClick={handleReset} className="p-3 bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white rounded-xl shadow-xl transition-all">
          <Target size={18} />
        </button>
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: any) => `
          <div style="background:#050816;border:1px solid rgba(34,211,238,0.3);padding:16px;border-radius:16px;font-family:monospace;min-width:220px;box-shadow:0 0 30px rgba(0,0,0,0.8)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:10px;font-weight:900;color:#22d3ee;text-transform:uppercase;letter-spacing:0.15em">${node.type}</span>
              <span style="font-size:10px;font-weight:900;color:${node.risk > 70 ? '#ef4444' : '#22c55e'}">${node.risk}% RISK</span>
            </div>
            ${node.role ? `<div style="margin-bottom:6px;padding:3px 8px;border-radius:6px;background:${node.role === 'centre' ? 'rgba(245,158,11,0.15)' : node.role === 'from' ? 'rgba(34,211,238,0.15)' : 'rgba(52,211,153,0.15)'};border:1px solid ${node.role === 'centre' ? 'rgba(245,158,11,0.4)' : node.role === 'from' ? 'rgba(34,211,238,0.4)' : 'rgba(52,211,153,0.4)'};display:inline-block"><span style="font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:0.15em;color:${node.role === 'centre' ? '#f59e0b' : node.role === 'from' ? '#22d3ee' : '#34d399'}">${node.role === 'centre' ? 'CENTRE WALLET' : node.role === 'from' ? 'FROM WALLET' : 'TO WALLET'}</span></div>` : ''}
            <div style="font-size:11px;color:white;font-weight:bold;margin-bottom:4px">${node.label}</div>
            <div style="font-size:9px;color:#64748b;word-break:break-all;opacity:0.7">${node.id}</div>
          </div>
        `}
        nodeRelSize={5}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          const isRoleNode = !!node.role;
          const radius = isRoleNode ? 9 : 6;
          ctx.font = `${fontSize}px JetBrains Mono`;
          const textWidth = ctx.measureText(label).width;

          const isHighlighted = highlightNodes.has(node.id) || highlightNodes.size === 0;

          // Draw outer ring for role nodes (from/to/centre)
          if (isRoleNode) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 1.5 / globalScale;
            ctx.globalAlpha = isHighlighted ? 0.5 : 0.1;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }

          // Draw node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.globalAlpha = isHighlighted ? 1 : 0.15;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Add glowing border to highlighted
          if (highlightNodes.has(node.id)) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
          }

          // Draw role badge above node
          if (isRoleNode) {
            const roleLabel = node.role === 'centre' ? 'CENTRE' : node.role === 'from' ? 'FROM' : 'TO';
            const roleFontSize = 9 / globalScale;
            ctx.font = `bold ${roleFontSize}px JetBrains Mono`;
            const roleWidth = ctx.measureText(roleLabel).width;
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.9;
            ctx.fillText(roleLabel, node.x - roleWidth / 2, node.y - radius - 3 / globalScale);
            ctx.globalAlpha = 1;
          }

          // Draw label below node
          ctx.font = `${fontSize}px JetBrains Mono`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, node.x - textWidth / 2, node.y + radius + fontSize + 2);
        }}
        nodePointerAreaPaint={(node: any, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.role ? 9 : 6, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        linkColor={(link: any) => highlightLinks.has(link) || highlightLinks.size === 0 ? 'rgba(34, 211, 238, 0.2)' : 'rgba(34, 211, 238, 0.02)'}
        linkDirectionalParticles={(link: any) => highlightLinks.has(link) || highlightLinks.size === 0 ? 4 : 0}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.005}
        linkWidth={(link: any) => highlightLinks.has(link) ? 2 : 1}
        onNodeClick={handleNodeClick}
        backgroundColor="transparent"
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};

export default GraphViewer;
