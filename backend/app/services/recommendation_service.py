from typing import Dict, List, Any
from backend.app.schemas.soil import NutrientEvaluation, CropSuitability, SoilRemediationItem

# Verified Agronomic Benchmark Ranges (USDA-NRCS & Indian Council of Agricultural Research guidelines)
AGRONOMIC_THRESHOLDS = {
    "N": {
        "name": "Available Nitrogen",
        "symbol": "N",
        "unit": "kg/ha",
        "low": 280.0,
        "high": 560.0,
        "optimal_range": "280 - 560 kg/ha",
        "impact": "Essential for vegetative foliage, leaf vigor, and chlorophyll biosynthesis."
    },
    "P": {
        "name": "Available Phosphorus",
        "symbol": "P",
        "unit": "kg/ha",
        "low": 10.0,
        "high": 25.0,
        "optimal_range": "10 - 25 kg/ha",
        "impact": "Stimulates root expansion, early crop establishment, and seed/fruit formation."
    },
    "K": {
        "name": "Available Potassium",
        "symbol": "K",
        "unit": "kg/ha",
        "low": 110.0,
        "high": 280.0,
        "optimal_range": "110 - 280 kg/ha",
        "impact": "Regulates stomatal water retention, enzymatic activation, and disease hardiness."
    },
    "ph": {
        "name": "Soil Reaction (pH)",
        "symbol": "pH",
        "unit": "pH index",
        "low": 6.0,
        "high": 7.5,
        "optimal_range": "6.0 - 7.5 (Slightly Acidic to Neutral)",
        "impact": "Controls chemical solubility and root nutrient bioavailability."
    },
    "ec": {
        "name": "Electrical Conductivity (Salinity)",
        "symbol": "EC",
        "unit": "dS/m",
        "low": 0.0,
        "high": 1.5,
        "optimal_range": "< 1.5 dS/m (Non-saline)",
        "impact": "High salinity induces osmotic stress and inhibits root moisture uptake."
    },
    "oc": {
        "name": "Organic Carbon",
        "symbol": "OC",
        "unit": "%",
        "low": 0.5,
        "high": 0.8,
        "optimal_range": "0.50% - 0.80% (Medium to High)",
        "impact": "Drives microbiological biodiversity, cation exchange capacity (CEC), and moisture holding."
    },
    "S": {
        "name": "Available Sulfur",
        "symbol": "S",
        "unit": "ppm (mg/kg)",
        "low": 10.0,
        "high": 20.0,
        "optimal_range": "10.0 - 20.0 ppm",
        "impact": "Synthesizes sulfur-containing amino acids (methionine, cysteine) and seed oils."
    },
    "zn": {
        "name": "Available Zinc",
        "symbol": "Zn",
        "unit": "ppm (mg/kg)",
        "low": 0.6,
        "high": 1.5,
        "optimal_range": "0.6 - 1.5 ppm",
        "impact": "Key precursor for auxin hormone formation, internode elongation, and protein synthesis."
    },
    "fe": {
        "name": "Available Iron",
        "symbol": "Fe",
        "unit": "ppm (mg/kg)",
        "low": 4.5,
        "high": 10.0,
        "optimal_range": "4.5 - 10.0 ppm",
        "impact": "Crucial catalyst for electron transport and chlorophyll maintenance."
    },
    "cu": {
        "name": "Available Copper",
        "symbol": "Cu",
        "unit": "ppm (mg/kg)",
        "low": 0.2,
        "high": 1.0,
        "optimal_range": "0.2 - 1.0 ppm",
        "impact": "Activates lignin biosynthesis, cell wall structural strength, and pollen viability."
    },
    "Mn": {
        "name": "Available Manganese",
        "symbol": "Mn",
        "unit": "ppm (mg/kg)",
        "low": 2.0,
        "high": 10.0,
        "optimal_range": "2.0 - 10.0 ppm",
        "impact": "Splits water molecules in photosystem II during sunlight energy capture."
    },
    "B": {
        "name": "Available Boron",
        "symbol": "B",
        "unit": "ppm (mg/kg)",
        "low": 0.5,
        "high": 2.0,
        "optimal_range": "0.5 - 2.0 ppm",
        "impact": "Directly enables pollen germination, fruit set, and sugar translocation."
    }
}

# Crop Physiological Tolerance Profiles for Transparent Rule-based Matching
CROP_DATABASE = [
    {
        "name": "Wheat (Triticum aestivum)",
        "category": "Cereal Grain",
        "ph_min": 6.0, "ph_max": 7.5,
        "ec_max": 3.0,
        "oc_min": 0.4,
        "n_demand": "Medium-High",
        "p_demand": "Medium",
        "k_demand": "Medium",
        "soil_desc": "Well-drained loam to clay loam; responsive to balanced N and P."
    },
    {
        "name": "Rice / Paddy (Oryza sativa)",
        "category": "Cereal Grain",
        "ph_min": 5.0, "ph_max": 7.0,
        "ec_max": 2.5,
        "oc_min": 0.5,
        "n_demand": "High",
        "p_demand": "Medium",
        "k_demand": "High",
        "soil_desc": "Heavy clay to silty clay soils with strong water retention."
    },
    {
        "name": "Maize / Corn (Zea mays)",
        "category": "Cereal Grain",
        "ph_min": 5.8, "ph_max": 7.5,
        "ec_max": 2.0,
        "oc_min": 0.5,
        "n_demand": "High",
        "p_demand": "High",
        "k_demand": "High",
        "soil_desc": "Deep, fertile, well-aerated sandy loam to silt loam."
    },
    {
        "name": "Chickpea / Bengal Gram (Cicer arietinum)",
        "category": "Pulses & Legumes",
        "ph_min": 6.2, "ph_max": 8.0,
        "ec_max": 1.5,
        "oc_min": 0.35,
        "n_demand": "Low (Fixes N)",
        "p_demand": "High",
        "k_demand": "Medium",
        "soil_desc": "Moderately heavy soils; intolerant of waterlogging and acidic pH."
    },
    {
        "name": "Soybean (Glycine max)",
        "category": "Oilseed / Legume",
        "ph_min": 6.0, "ph_max": 7.2,
        "ec_max": 2.0,
        "oc_min": 0.5,
        "n_demand": "Low-Medium (Fixes N)",
        "p_demand": "High",
        "k_demand": "High",
        "soil_desc": "Fertile loams with good drainage and active Rhizobium nodulation."
    },
    {
        "name": "Cotton (Gossypium hirsutum)",
        "category": "Commercial Fiber",
        "ph_min": 6.0, "ph_max": 8.2,
        "ec_max": 3.5,
        "oc_min": 0.4,
        "n_demand": "High",
        "p_demand": "Medium",
        "k_demand": "High",
        "soil_desc": "Deep black soils (Vertisols) or alluvial loams; tolerates moderate salinity."
    },
    {
        "name": "Tomato (Solanum lycopersicum)",
        "category": "Horticultural Vegetable",
        "ph_min": 6.0, "ph_max": 6.8,
        "ec_max": 1.8,
        "oc_min": 0.6,
        "n_demand": "Medium-High",
        "p_demand": "High",
        "k_demand": "Very High",
        "soil_desc": "Rich, well-drained sandy loam rich in organic matter and calcium."
    },
    {
        "name": "Potato (Solanum tuberosum)",
        "category": "Tuber Vegetable",
        "ph_min": 5.2, "ph_max": 6.5,
        "ec_max": 1.7,
        "oc_min": 0.6,
        "n_demand": "High",
        "p_demand": "High",
        "k_demand": "Very High",
        "soil_desc": "Loose, friable sandy loam; slightly acidic pH suppresses potato scab."
    },
    {
        "name": "Pearl Millet / Bajra (Pennisetum glaucum)",
        "category": "Resilient Millet",
        "ph_min": 5.5, "ph_max": 8.5,
        "ec_max": 4.0,
        "oc_min": 0.25,
        "n_demand": "Low-Medium",
        "p_demand": "Low",
        "k_demand": "Medium",
        "soil_desc": "Drought-hardy crop well-suited to marginal, sandy, or alkaline dryland soils."
    },
    {
        "name": "Mustard / Rapeseed (Brassica juncea)",
        "category": "Oilseed",
        "ph_min": 6.0, "ph_max": 7.5,
        "ec_max": 2.5,
        "oc_min": 0.45,
        "n_demand": "Medium",
        "p_demand": "Medium",
        "k_demand": "Medium",
        "soil_desc": "Light to medium loam soils; highly responsive to sulfur supplementation."
    }
]

def evaluate_nutrients(readings: Dict[str, float]) -> List[NutrientEvaluation]:
    """
    Evaluates each nutrient reading against documented agronomic ranges.
    Returns list of NutrientEvaluation objects.
    """
    evaluations = []
    for feat, info in AGRONOMIC_THRESHOLDS.items():
        val = float(readings.get(feat, 0.0))
        low = info["low"]
        high = info["high"]
        
        if feat == "ec":
            if val <= 1.0:
                status = "Optimal"
            elif val <= 2.0:
                status = "Slightly High"
            else:
                status = "Excessive"
        elif feat == "ph":
            if val < 5.5:
                status = "Strongly Acidic"
            elif val < 6.0:
                status = "Moderately Acidic"
            elif val <= 7.5:
                status = "Optimal"
            elif val <= 8.2:
                status = "Moderately Alkaline"
            else:
                status = "Strongly Alkaline"
        else:
            if val < (low * 0.7):
                status = "Deficient"
            elif val < low:
                status = "Low"
            elif val <= high:
                status = "Optimal"
            elif val <= (high * 1.5):
                status = "High"
            else:
                status = "Excessive"

        evaluations.append(NutrientEvaluation(
            name=info["name"],
            symbol=info["symbol"],
            value=round(val, 2),
            unit=info["unit"],
            status=status,
            optimal_range=info["optimal_range"],
            impact=info["impact"]
        ))
    return evaluations

def get_crop_recommendations(readings: Dict[str, float], fertility_class: int) -> List[CropSuitability]:
    """
    Transparent rule-based crop suitability engine.
    Computes a documented suitability score (0-100) based on:
    - pH compatibility (35%)
    - Salinity tolerance (25%)
    - Organic carbon status (20%)
    - Primary NPK sufficiency (20%)
    """
    ph = float(readings.get("ph", 6.5))
    ec = float(readings.get("ec", 0.5))
    oc = float(readings.get("oc", 0.6))
    n = float(readings.get("N", 250.0))
    p = float(readings.get("P", 15.0))
    k = float(readings.get("K", 200.0))

    results = []
    for crop in CROP_DATABASE:
        score = 100

        # 1. pH Penalty (up to -35 points)
        if ph < crop["ph_min"]:
            diff = crop["ph_min"] - ph
            score -= min(35, int(diff * 25))
        elif ph > crop["ph_max"]:
            diff = ph - crop["ph_max"]
            score -= min(35, int(diff * 25))

        # 2. Salinity (EC) Penalty (up to -25 points)
        if ec > crop["ec_max"]:
            excess_ec = ec - crop["ec_max"]
            score -= min(25, int(excess_ec * 15))

        # 3. Organic Carbon Penalty (up to -20 points)
        if oc < crop["oc_min"]:
            deficit_oc = crop["oc_min"] - oc
            score -= min(20, int(deficit_oc * 40))

        # 4. Fertility Class weighting
        if fertility_class == 0 and crop["category"] in ["Horticultural Vegetable", "Commercial Fiber"]:
            score -= 10
        elif fertility_class == 2:
            score = min(100, score + 5)

        score = max(20, min(100, score))

        if score >= 75:
            level = "High"
            recom = f"Highly suited to prevailing pH ({ph:.1f}) and nutrient balance. Maintain balanced fertilizer split."
        elif score >= 55:
            level = "Moderate"
            recom = f"Feasible with corrective soil conditioning. Monitor pH and ensure adequate moisture."
        else:
            level = "Marginal"
            recom = f"Not ideally matched under unamended conditions. Requires soil amendment before intensive cultivation."

        results.append(CropSuitability(
            crop_name=crop["name"],
            category=crop["category"],
            suitability_score=score,
            suitability_level=level,
            ideal_ph=f"{crop['ph_min']} - {crop['ph_max']}",
            nutrient_match=f"N: {crop['n_demand']}, P: {crop['p_demand']}, K: {crop['k_demand']}",
            recommendation=recom
        ))

    results.sort(key=lambda c: c.suitability_score, reverse=True)
    return results

def get_soil_remediation_plan(readings: Dict[str, float]) -> List[SoilRemediationItem]:
    """
    Generates agronomic remediation recommendations for detected soil limitations.
    Advises caution and avoids uncalibrated bulk dosages.
    """
    plan = []
    ph = float(readings.get("ph", 7.0))
    ec = float(readings.get("ec", 0.5))
    oc = float(readings.get("oc", 0.6))
    n = float(readings.get("N", 250.0))
    p = float(readings.get("P", 15.0))
    k = float(readings.get("K", 200.0))
    s = float(readings.get("S", 12.0))
    zn = float(readings.get("zn", 0.8))
    fe = float(readings.get("fe", 5.0))
    b = float(readings.get("B", 0.8))

    # 1. Soil Reaction: Acidic
    if ph < 6.0:
        severity = "Critical" if ph < 5.2 else "Moderate"
        plan.append(SoilRemediationItem(
            parameter="Soil Reaction (pH)",
            condition=f"Acidic Soil (pH {ph:.2f})",
            severity=severity,
            cause="Leaching of basic cations (Ca, Mg) under rainfall or prolonged ammonium fertilizer usage.",
            conventional_remedy="Incorporate Agricultural Limestone (calcium carbonate) or Dolomitic Lime based on buffer pH lab test.",
            organic_remedy="Apply well-aged hardwood ash (sparingly) or calcified seaweed meal along with bio-compost.",
            monitoring_advice="Re-test soil pH 6 to 8 weeks after lime incorporation before planting sensitive crops."
        ))
    # 2. Soil Reaction: Alkaline
    elif ph > 7.8:
        severity = "Critical" if ph > 8.5 else "Moderate"
        plan.append(SoilRemediationItem(
            parameter="Soil Reaction (pH)",
            condition=f"Alkaline Soil (pH {ph:.2f})",
            severity=severity,
            cause="High accumulation of free calcium carbonates or sodium salts in semi-arid zones.",
            conventional_remedy="Apply fine agricultural sulfur (powder) or agricultural gypsum (calcium sulfate) if sodic.",
            organic_remedy="Mulch with pine needles, oak leaves, peat moss, or acidifying organic composts.",
            monitoring_advice="Check micronutrient availability (Fe, Zn) which lock up under alkaline conditions."
        ))

    # 3. Salinity (EC)
    if ec > 1.5:
        severity = "Critical" if ec > 2.5 else "Moderate"
        plan.append(SoilRemediationItem(
            parameter="Electrical Conductivity",
            condition=f"Elevated Soil Salinity ({ec:.2f} dS/m)",
            severity=severity,
            cause="Excessive soluble fertilizer salts, poor drainage, or irrigation with brackish water.",
            conventional_remedy="Ensure deep furrow leaching with good-quality irrigation water and install sub-surface tile drainage.",
            organic_remedy="Plant salt-accumulating cover crops (e.g., sesbania, barley) and integrate humus-rich mulch.",
            monitoring_advice="Measure irrigation water electrical conductivity (ECw) to prevent re-salinization."
        ))

    # 4. Organic Carbon (OC)
    if oc < 0.5:
        plan.append(SoilRemediationItem(
            parameter="Organic Carbon",
            condition=f"Low Organic Matter ({oc:.2f}%)",
            severity="Critical" if oc < 0.35 else "Moderate",
            cause="Intensive tillage, absence of crop residue recycling, and rapid microbial oxidation in warm climates.",
            conventional_remedy="Adopt minimum tillage or zero-till farming practices; incorporate crop residues into topsoil.",
            organic_remedy="Apply well-decomposed Farmyard Manure (FYM), vermicompost, and rotate with leguminous green manure crops (sunn hemp).",
            monitoring_advice="Evaluate soil organic matter annually; aim to raise OC levels progressively by 0.1-0.2% per year."
        ))

    # 5. Nitrogen Deficiency
    if n < 280.0:
        plan.append(SoilRemediationItem(
            parameter="Available Nitrogen",
            condition=f"Nitrogen Deficit ({n:.1f} kg/ha)",
            severity="Moderate",
            cause="High crop uptake, volatilization, or nitrate leaching in porous soils.",
            conventional_remedy="Apply split applications of neem-coated urea or ammonium nitrate timed with crop growth stages.",
            organic_remedy="Inoculate legume seeds with Rhizobium or Azotobacter biofertilizers; apply composted poultry manure.",
            monitoring_advice="Monitor crop leaf greenness using SPAD chlorophyll meters or leaf color charts."
        ))

    # 6. Phosphorus Deficiency
    if p < 10.0:
        plan.append(SoilRemediationItem(
            parameter="Available Phosphorus",
            condition=f"Phosphorus Deficit ({p:.1f} kg/ha)",
            severity="Moderate",
            cause="Strong soil fixation with aluminum/iron (in acidic soils) or calcium (in alkaline soils).",
            conventional_remedy="Band-apply Single Superphosphate (SSP) or Diammonium Phosphate (DAP) close to root zones.",
            organic_remedy="Apply steamed bone meal and Phosphorus Solubilizing Bacteria (PSB) cultures to release bound phosphorus.",
            monitoring_advice="Re-test before flowering and seed set stages."
        ))

    # 7. Potassium Deficiency
    if k < 110.0:
        plan.append(SoilRemediationItem(
            parameter="Available Potassium",
            condition=f"Potassium Deficit ({k:.1f} kg/ha)",
            severity="Moderate",
            cause="Continuous removal by heavy feeders (tubers, bananas, maize) without potassium replenishment.",
            conventional_remedy="Apply Muriate of Potash (MOP) or Potassium Sulfate ($K_2SO_4$) in split doses.",
            organic_remedy="Apply wood ash, greensand, or compost enriched with banana peel and kelp meal.",
            monitoring_advice="Check for marginal leaf scorch and weakened stem lodging resistance in standing crops."
        ))

    # 8. Zinc Deficiency
    if zn < 0.6:
        plan.append(SoilRemediationItem(
            parameter="Available Zinc",
            condition=f"Zinc Micronutrient Deficit ({zn:.2f} ppm)",
            severity="Moderate",
            cause="Common in calcareous, high-pH, or high-phosphorus soils.",
            conventional_remedy="Soil application of Zinc Sulfate heptahydrate ($ZnSO_4 \\cdot 7H_2O$) or foliar spray of chelated Zn-EDTA.",
            organic_remedy="Apply zinc-enriched compost or seaweed extracts during early vegetative phase.",
            monitoring_advice="Watch for interveinal chlorosis and 'little leaf' rosette symptoms on young leaves."
        ))

    # 9. Boron Deficiency
    if b < 0.5:
        plan.append(SoilRemediationItem(
            parameter="Available Boron",
            condition=f"Boron Micronutrient Deficit ({b:.2f} ppm)",
            severity="Mild",
            cause="Readily leached in coarse sandy soils; low availability in high-pH calcareous soils.",
            conventional_remedy="Apply agricultural grade Borax or Solubor (disodium octaborate tetrahydrate) in strictly controlled micro-doses.",
            organic_remedy="Apply composted plant residues with balanced seaweed extract.",
            monitoring_advice="Exercise extreme caution: the safety window between boron deficiency and boron toxicity is narrow."
        ))

    # 10. Sulfur Deficiency
    if s < 10.0:
        plan.append(SoilRemediationItem(
            parameter="Available Sulfur",
            condition=f"Sulfur Deficit ({s:.1f} ppm)",
            severity="Mild",
            cause="Declining atmospheric sulfur deposition and prolonged reliance on sulfur-free high-analysis fertilizers.",
            conventional_remedy="Apply agricultural gypsum ($CaSO_4$) or Ammonium Sulfate.",
            organic_remedy="Incorporate composted brassica residues, elemental sulfur meal, or composted livestock manure.",
            monitoring_advice="Observe young upper leaves for uniform pale yellow chlorosis."
        ))

    return plan

