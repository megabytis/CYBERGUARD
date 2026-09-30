from typing import List, Tuple
from app.core.rules import RuleFinding
from app.config import settings

class RiskScorer:
    """
    Combines deterministic heuristic weights and local ML inference
    into an explainable 0–100 risk score.
    """

    @classmethod
    def calculate_heuristic_score(cls, findings: List[RuleFinding]) -> float:
        """
        Aggregates heuristic points from firing rules with non-linear saturation.
        Ensures multiple distinct severe indicators push score into Critical/High.
        """
        if not findings:
            return 0.0

        total_weight = sum(f.weight for f in findings)
        # Cap at 100.0
        return min(100.0, round(total_weight, 1))

    @classmethod
    def compute_risk(
        cls,
        findings: List[RuleFinding],
        ml_score: float,
        heuristic_weight: float = None,
        ml_weight: float = None,
    ) -> Tuple[int, str, float]:
        """
        Calculates composite risk score and risk level.
        Returns: (risk_score_int, risk_level_str, heuristic_score_float)
        """
        h_weight = heuristic_weight if heuristic_weight is not None else settings.heuristic_weight
        m_weight = ml_weight if ml_weight is not None else settings.ml_weight

        # Normalize weights if they don't sum to 1.0
        weight_sum = h_weight + m_weight
        if weight_sum > 0:
            h_weight /= weight_sum
            m_weight /= weight_sum
        else:
            h_weight, m_weight = 0.7, 0.3

        heuristic_score = cls.calculate_heuristic_score(findings)

        # Baseline composite score (70% Rules + 30% ML)
        composite = (heuristic_score * h_weight) + (ml_score * m_weight)

        # Security Preemption Rule:
        # A deterministic rule detection of CRITICAL or HIGH severity must NEVER be diluted into SAFE by ML!
        has_critical = any(f.severity == "CRITICAL" for f in findings)
        has_high = any(f.severity == "HIGH" for f in findings)

        if has_critical:
            # Verified critical threat (e.g. brand typosquatting, malware payload, credential harvester)
            # Minimum floor is 75 (HIGH risk tier)
            composite = max(composite, heuristic_score, 75.0)
        elif has_high:
            # Verified high threat (e.g. deceptive auth lure, credential path)
            # Minimum floor is 55 (SUSPICIOUS/REVIEW risk tier)
            composite = max(composite, heuristic_score * 0.85, 55.0)
        elif heuristic_score > 0:
            composite = max(composite, heuristic_score * 0.75)

        final_score = int(round(max(0.0, min(100.0, composite))))

        # Classify risk tier
        if final_score <= 30:
            level = "LOW"
        elif final_score <= 70:
            level = "MEDIUM"
        else:
            level = "HIGH"

        return final_score, level, heuristic_score
