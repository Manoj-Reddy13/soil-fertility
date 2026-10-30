from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text
from backend.app.models.database import Base

class SoilSample(Base):
    __tablename__ = "soil_samples"

    id = Column(Integer, primary_key=True, index=True)
    sample_name = Column(String(100), nullable=True, default="Soil Sample")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Primary Nutrients (N, P, K)
    N = Column(Float, nullable=False)
    P = Column(Float, nullable=False)
    K = Column(Float, nullable=False)
    
    # Soil Physical/Chemical Properties
    ph = Column(Float, nullable=False)
    ec = Column(Float, nullable=False)
    oc = Column(Float, nullable=False)
    
    # Micronutrients & Secondary
    S = Column(Float, nullable=False)
    zn = Column(Float, nullable=False)
    fe = Column(Float, nullable=False)
    cu = Column(Float, nullable=False)
    Mn = Column(Float, nullable=False)
    B = Column(Float, nullable=False)
    
    # Prediction Results
    fertility_class = Column(Integer, nullable=False)
    fertility_label = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    prob_less_fertile = Column(Float, nullable=False)
    prob_fertile = Column(Float, nullable=False)
    prob_highly_fertile = Column(Float, nullable=False)
    
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sample_name": self.sample_name or f"Sample #{self.id}",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "readings": {
                "N": self.N, "P": self.P, "K": self.K,
                "ph": self.ph, "ec": self.ec, "oc": self.oc,
                "S": self.S, "zn": self.zn, "fe": self.fe,
                "cu": self.cu, "Mn": self.Mn, "B": self.B
            },
            "fertility_class": self.fertility_class,
            "fertility_label": self.fertility_label,
            "confidence": self.confidence,
            "probabilities": {
                "Less Fertile": self.prob_less_fertile,
                "Fertile": self.prob_fertile,
                "Highly Fertile": self.prob_highly_fertile
            },
            "notes": self.notes,
            "is_demo": self.is_demo
        }

