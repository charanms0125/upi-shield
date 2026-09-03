import networkx as nx
from typing import Dict, Any, List, Optional
from app.ml.synthetic_data import generate_fraud_graph_data

class FraudGraphService:
    def __init__(self):
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self):
        self.graph.clear()
        data = generate_fraud_graph_data()
        
        for node in data["nodes"]:
            self.graph.add_node(
                node["id"],
                label=node["label"],
                type=node["type"],
                risk_score=node["risk_score"],
                risk_category=node["risk_category"],
                report_count=node["report_count"]
            )
            
        for edge in data["edges"]:
            self.graph.add_edge(
                edge["source"],
                edge["target"],
                relation=edge["relation"],
                risk_weight=edge["risk_weight"]
            )

    def get_full_network(self) -> Dict[str, Any]:
        nodes_out = []
        for n_id, attrs in self.graph.nodes(data=True):
            in_degree = self.graph.in_degree(n_id)
            out_degree = self.graph.out_degree(n_id)
            neighbors = list(self.graph.neighbors(n_id)) + list(self.graph.predecessors(n_id))
            
            nodes_out.append({
                "id": n_id,
                "label": attrs.get("label", n_id),
                "type": attrs.get("type", "UNKNOWN"),
                "risk_score": attrs.get("risk_score", 10.0),
                "risk_category": attrs.get("risk_category", "LOW"),
                "report_count": attrs.get("report_count", 0),
                "details": {
                    "total_connections": in_degree + out_degree,
                    "connected_nodes": list(set(neighbors)),
                    "in_degree": in_degree,
                    "out_degree": out_degree
                }
            })
            
        edges_out = []
        for u, v, attrs in self.graph.edges(data=True):
            edges_out.append({
                "source": u,
                "target": v,
                "relation": attrs.get("relation", "TRANSFERS_TO"),
                "risk_weight": attrs.get("risk_weight", 0.5)
            })

        # Count suspicious clusters
        suspicious_count = sum(1 for _, d in self.graph.nodes(data=True) if d.get("risk_category") in ["HIGH", "CRITICAL"])

        return {
            "nodes": nodes_out,
            "edges": edges_out,
            "total_nodes": len(nodes_out),
            "total_edges": len(edges_out),
            "suspicious_clusters_count": max(suspicious_count // 3, 2)
        }

    def get_node_details(self, node_id: str) -> Optional[Dict[str, Any]]:
        if not self.graph.has_node(node_id):
            return None
            
        attrs = self.graph.nodes[node_id]
        predecessors = list(self.graph.predecessors(node_id))
        successors = list(self.graph.successors(node_id))
        all_connected = list(set(predecessors + successors))
        
        connected_details = []
        for conn_id in all_connected:
            conn_attrs = self.graph.nodes.get(conn_id, {})
            connected_details.append({
                "id": conn_id,
                "label": conn_attrs.get("label", conn_id),
                "type": conn_attrs.get("type", "UNKNOWN"),
                "risk_score": conn_attrs.get("risk_score", 10)
            })

        return {
            "id": node_id,
            "label": attrs.get("label", node_id),
            "type": attrs.get("type", "UNKNOWN"),
            "risk_score": attrs.get("risk_score", 10),
            "risk_category": attrs.get("risk_category", "LOW"),
            "report_count": attrs.get("report_count", 0),
            "connected_count": len(all_connected),
            "connected_entities": connected_details,
            "is_hub": (len(all_connected) >= 3 and attrs.get("risk_score", 0) > 60)
        }

fraud_graph_service = FraudGraphService()
