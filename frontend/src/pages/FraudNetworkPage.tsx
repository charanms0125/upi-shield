import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Network, Search, ZoomIn, ZoomOut, RotateCcw, AlertTriangle,
  User, CreditCard, Phone, ShieldAlert, ArrowRight, ShieldCheck,
  Building2, Filter, Info
} from 'lucide-react';
import { networkApi } from '../services/api';
import { FraudNetworkData, FraudNetworkNode } from '../types';
import { RiskMeter } from '../components/RiskMeter';

export const FraudNetworkPage: React.FC = () => {
  const location = useLocation();
  const [data, setData] = useState<FraudNetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<FraudNetworkNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        const net = await networkApi.getNetwork();
        setData(net);
        // Default select high risk hub or from location state
        const targetId = location.state?.demoPayload?.focusNode || 'UPI_SCAM_1';
        const found = net.nodes.find(n => n.id === targetId) || net.nodes[0];
        if (found) setSelectedNode(found);
      } catch (e) {
        console.error('Failed to load fraud graph:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchGraph();
  }, [location.state]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Building NetworkX graph topology and community links...</p>
      </div>
    );
  }

  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  // Filter nodes
  const filteredNodes = nodes.filter(n => {
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) || n.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Position nodes in an aesthetic circular / cluster layout
  const getNodeCoordinates = (index: number, total: number) => {
    const width = 760;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    // Distribute into 3 clusters:
    // Cluster 1 (Left): Syndicate 1
    // Cluster 2 (Right): Syndicate 2
    // Cluster 3 (Bottom): Clean entities
    if (index < 6) {
      // Cluster 1
      const angle = (index / 6) * 2 * Math.PI;
      return { x: centerX - 180 + Math.cos(angle) * 110, y: centerY - 40 + Math.sin(angle) * 110 };
    } else if (index < 9) {
      // Victims connected to Syndicate 1
      const angle = ((index - 6) / 3) * Math.PI + Math.PI / 2;
      return { x: centerX - 240 + Math.cos(angle) * 120, y: centerY - 140 + Math.sin(angle) * 60 };
    } else if (index < 13) {
      // Cluster 2
      const angle = ((index - 9) / 4) * 2 * Math.PI;
      return { x: centerX + 180 + Math.cos(angle) * 100, y: centerY - 40 + Math.sin(angle) * 100 };
    } else {
      // Clean baseline cluster
      const offset = (index - 13) * 120;
      return { x: centerX - 180 + offset, y: centerY + 160 };
    }
  };

  const nodePositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, idx) => {
    nodePositions[n.id] = getNodeCoordinates(idx, nodes.length);
  });

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'USER': return User;
      case 'UPI': return CreditCard;
      case 'ACCOUNT': return Building2;
      case 'PHONE': return Phone;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-16 pt-4">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Network className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-semibold uppercase text-emerald-400 tracking-wider">
              NETWORKX GRAPH ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Fraud Ring & Money Mule Network Intelligence
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Interactive multi-entity graph visualizing synthetic laundering rings, connected payment VPAs,
            burner phone numbers, and destination cashout accounts.
          </p>
        </div>

        {/* Top summary stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Total Entities: </span>
            <span className="font-mono font-bold text-white">{data?.total_nodes}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Relationships: </span>
            <span className="font-mono font-bold text-white">{data?.total_edges}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs">
            <span className="text-red-300">Fraud Clusters: </span>
            <span className="font-mono font-bold text-red-400">{data?.suspicious_clusters_count}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 cyber-card p-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search node or UPI ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Entity Types</option>
            <option value="USER">Users</option>
            <option value="UPI">UPI VPAs</option>
            <option value="ACCOUNT">Bank Accounts</option>
            <option value="PHONE">Phone Numbers</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 overflow-x-auto pb-1 sm:pb-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Critical / High Risk</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Verified / Low Risk</span>
          </span>
          <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
              title="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual Graph on Left, Node Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Graph Viewport */}
        <div className="lg:col-span-8 cyber-card p-4 overflow-hidden relative min-h-[540px] flex items-center justify-center bg-[#070B12]">
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg viewBox="0 0 760 500" className="w-full h-full max-h-[500px]">
              <defs>
                <marker
                  id="arrow-high"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                </marker>
                <marker
                  id="arrow-clean"
                  viewBox="0 0 10 10"
                  refX="22"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
                </marker>
              </defs>

              {/* Edges */}
              {edges.map((edge, idx) => {
                const s = nodePositions[edge.source];
                const t = nodePositions[edge.target];
                if (!s || !t) return null;
                const isHigh = edge.risk_weight > 0.6;

                return (
                  <g key={idx}>
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={isHigh ? '#EF4444' : '#10B981'}
                      strokeWidth={isHigh ? 1.8 : 1.2}
                      strokeOpacity={isHigh ? 0.6 : 0.35}
                      strokeDasharray={edge.relation.includes('RAPID') ? '4 2' : undefined}
                      markerEnd={isHigh ? 'url(#arrow-high)' : 'url(#arrow-clean)'}
                    />
                    {/* Edge Label on hover or mid */}
                    <text
                      x={(s.x + t.x) / 2}
                      y={(s.y + t.y) / 2 - 4}
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="sans-serif"
                      textAnchor="middle"
                      className="opacity-60 hover:opacity-100 transition-opacity select-none pointer-events-none"
                    >
                      {edge.relation.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                const isSelected = selectedNode?.id === node.id;
                const isCritical = node.risk_score >= 80;
                const isHigh = node.risk_score >= 60;
                const strokeColor = isCritical ? '#EF4444' : (isHigh ? '#F97316' : '#10B981');
                const fillColor = isSelected ? '#1E293B' : '#0F172A';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-110 group"
                  >
                    {/* Pulse circle for critical nodes */}
                    {isCritical && (
                      <circle
                        r="24"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1"
                        opacity="0.3"
                        className="animate-ping"
                      />
                    )}

                    {/* Node base circle */}
                    <circle
                      r={isSelected ? 20 : 16}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all"
                    />

                    {/* Node Type Abbr in center */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#E2E8F0"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="select-none"
                    >
                      {node.type === 'ACCOUNT' ? 'ACC' : (node.type === 'PHONE' ? 'TEL' : node.type)}
                    </text>

                    {/* Label below node */}
                    <text
                      textAnchor="middle"
                      dy={isSelected ? 32 : 28}
                      fill={isSelected ? '#38BDF8' : '#94A3B8'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      fontFamily="sans-serif"
                      className="select-none"
                    >
                      {node.label.length > 18 ? node.label.slice(0, 16) + '..' : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 font-mono">
            * Interactive topology powered by NetworkX graph algorithms. Click any node to inspect links.
          </div>
        </div>

        {/* Right: Selected Node Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="cyber-card p-6 space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono uppercase text-slate-400">
                  ENTITY INSPECTOR
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                  {selectedNode.type}
                </span>
              </div>

              {/* Node Title & Risk */}
              <div>
                <h3 className="font-bold text-white text-base leading-snug">{selectedNode.label}</h3>
                <span className="text-xs font-mono text-slate-400">{selectedNode.id}</span>
              </div>

              <div className="flex items-center justify-center py-2">
                <RiskMeter
                  score={selectedNode.risk_score}
                  category={selectedNode.risk_category}
                  size="md"
                />
              </div>

              {/* Node Properties */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] uppercase">Graph Links</span>
                  <div className="text-xl font-bold font-mono text-white">
                    {selectedNode.details?.total_connections || 3}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 text-[11px] uppercase">Complaints / Reports</span>
                  <div className="text-xl font-bold font-mono text-red-400">
                    {selectedNode.report_count}
                  </div>
                </div>
              </div>

              {/* Connected Neighbors List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  DIRECTLY CONNECTED NODES
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(selectedNode.details?.connected_nodes || []).map((connId, i) => {
                    const connNode = nodes.find(n => n.id === connId);
                    return (
                      <button
                        key={i}
                        onClick={() => connNode && setSelectedNode(connNode)}
                        className="w-full text-left p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-xs transition-colors"
                      >
                        <span className="text-slate-300 font-medium truncate">
                          {connNode?.label || connId}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {connNode?.type || 'LINK'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedNode.risk_score >= 60 && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-xs text-red-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Laundering Ring Hub Indicator</span>
                  </div>
                  <p className="text-[11px] text-red-300/80">
                    Entity is a conduit in multi-hop layered cashout transfers. Recommend freezing beneficiary account at PSP registrar.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="cyber-card p-8 text-center space-y-3">
              <p className="text-xs text-slate-400">Click any entity node in the graph to view relationship analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
