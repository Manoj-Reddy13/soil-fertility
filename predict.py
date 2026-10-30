import argparse
import json
import pandas as pd
from classifier import SoilQualityClassifier, REQUIRED_FEATURES

def run_benchmark():
    print("=" * 70)
    print("  Soil Quality & Fertility Prediction - Benchmark Demo")
    print("=" * 70)
    
    classifier = SoilQualityClassifier()
    df = pd.read_csv("Data/Soil Fertility Data (Modified Data).csv")
    
    category_names = {0: "Less Fertile", 1: "Fertile", 2: "Highly Fertile"}
    
    print("\nEvaluating sample test cases from the dataset for each category:\n")
    
    for target_class in [0, 1, 2]:
        samples = df[df['fertility'] == target_class]
        if len(samples) == 0:
            continue
        sample_row = samples.iloc[0]
        
        sample_dict = {feat: float(sample_row[feat]) for feat in REQUIRED_FEATURES}
        true_label = category_names[target_class]
        
        res = classifier.compute_prediction(sample_dict)
        
        print(f"--- Sample Class {target_class}: Expected '{true_label}' ---")
        print(f"  Input readings:")
        print(f"    N={sample_dict['N']}, P={sample_dict['P']}, K={sample_dict['K']}, pH={sample_dict['ph']}, EC={sample_dict['ec']}, OC={sample_dict['oc']}")
        print(f"    S={sample_dict['S']}, Zn={sample_dict['zn']}, Fe={sample_dict['fe']}, Cu={sample_dict['cu']}, Mn={sample_dict['Mn']}, B={sample_dict['B']}")
        print(f"  Result:")
        print(f"    Prediction: {res['fertility_status']} (Class {res['class_index']})")
        print(f"    Confidence: {res['confidence']}%")
        print(f"    Probabilities: {res['probabilities']}")
        status_icon = "[PASS]" if res['fertility_status'] == true_label else "[FAIL]"
        print(f"    Status: {status_icon}\n")

    print("=" * 70)

def main():
    parser = argparse.ArgumentParser(description="Predict soil fertility from elemental analysis.")
    parser.add_argument("--json", type=str, help="Soil parameters as JSON string.")
    parser.add_argument("--interactive", action="store_true", help="Prompt for soil readings interactively.")
    args = parser.parse_args()

    if args.json:
        data = json.loads(args.json)
        classifier = SoilQualityClassifier()
        result = classifier.compute_prediction(data)
        print(json.dumps(result, indent=2))
    elif args.interactive:
        classifier = SoilQualityClassifier()
        print("\nEnter soil measurement values:")
        readings = {}
        for feat in REQUIRED_FEATURES:
            val = input(f"  {feat}: ")
            readings[feat] = float(val)
        result = classifier.compute_prediction(readings)
        print("\nPrediction Result:")
        print(json.dumps(result, indent=2))
    else:
        run_benchmark()

if __name__ == "__main__":
    main()

