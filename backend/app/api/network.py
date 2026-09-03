from fastapi import APIRouter, HTTPException
from app.services.graph_service import fraud_graph_service
from app.schemas.fraud import FraudNetworkGraphResponse

router = APIRouter(prefix="/fraud-network", tags=["Fraud Network Intelligence"])

@router.get("", response_model=FraudNetworkGraphResponse)
def get_fraud_network():
    try:
        return fraud_graph_service.get_full_network()
    except Exception as e:
        print(f"[FraudNetwork Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to generate fraud network graph")

@router.get("/node/{node_id}")
def get_network_node_details(node_id: str):
    details = fraud_graph_service.get_node_details(node_id)
    if not details:
        raise HTTPException(status_code=404, detail="Entity node not found in fraud network")
    return details
