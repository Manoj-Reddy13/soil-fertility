import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from classifier import SoilQualityClassifier, REQUIRED_FEATURES

classifier = None

HTML_PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Soil Quality & Fertility Prediction</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --primary: #10b981;
      --primary-hover: #059669;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --input-bg: #0f172a;
      --border-color: #475569;
      --fertile-high: #10b981;
      --fertile-med: #f59e0b;
      --fertile-low: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 16px;
    }
    .container {
      width: 100%;
      max-width: 900px;
    }
    header {
      text-align: center;
      margin-bottom: 28px;
    }
    header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    header p {
      color: var(--text-muted);
      margin-top: 8px;
      font-size: 0.95rem;
    }
    .presets {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .preset-btn {
      background: #334155;
      color: #e2e8f0;
      border: 1px solid #475569;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .preset-btn:hover {
      background: #475569;
      color: #fff;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .form-group input {
      background: var(--input-bg);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 9px 12px;
      color: #fff;
      font-size: 0.95rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      border-color: #38bdf8;
    }
    .btn-submit {
      width: 100%;
      background: var(--primary);
      color: #0f172a;
      border: none;
      padding: 13px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-submit:hover {
      background: var(--primary-hover);
    }
    .result-box {
      margin-top: 24px;
      padding: 20px;
      border-radius: 10px;
      background: #0f172a;
      border: 1px solid var(--card-border);
      display: none;
    }
    .result-box.active {
      display: block;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 1.1rem;
      margin-bottom: 12px;
    }
    .badge-0 { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .badge-1 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #f59e0b; }
    .badge-2 { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .prob-bar {
      margin-top: 10px;
    }
    .prob-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 4px;
      color: var(--text-muted);
    }
    .bar-bg {
      background: #334155;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: #38bdf8;
      border-radius: 4px;
      transition: width 0.4s ease;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🌱 Soil Quality & Fertility Prediction</h1>
      <p>Machine Learning Elemental Soil Analysis (Random Forest Model • 97.3% Accuracy)</p>
    </header>

    <div class="presets">
      <span style="align-self: center; font-size: 0.85rem; color: #94a3b8;">Load Preset:</span>
      <button class="preset-btn" onclick="setPreset(0)">Less Fertile Sample</button>
      <button class="preset-btn" onclick="setPreset(1)">Fertile Sample</button>
      <button class="preset-btn" onclick="setPreset(2)">Highly Fertile Sample</button>
    </div>

    <div class="card">
      <form id="soilForm">
        <div class="grid">
          <div class="form-group"><label>N (Nitrogen ratio)</label><input type="number" step="any" id="N" required></div>
          <div class="form-group"><label>P (Phosphorous ratio)</label><input type="number" step="any" id="P" required></div>
          <div class="form-group"><label>K (Potassium ratio)</label><input type="number" step="any" id="K" required></div>
          <div class="form-group"><label>pH (Soil Acidity)</label><input type="number" step="any" id="ph" required></div>
          <div class="form-group"><label>EC (Electrical Cond.)</label><input type="number" step="any" id="ec" required></div>
          <div class="form-group"><label>OC (Organic Carbon)</label><input type="number" step="any" id="oc" required></div>
          <div class="form-group"><label>S (Sulfur)</label><input type="number" step="any" id="S" required></div>
          <div class="form-group"><label>Zn (Zinc)</label><input type="number" step="any" id="zn" required></div>
          <div class="form-group"><label>Fe (Iron)</label><input type="number" step="any" id="fe" required></div>
          <div class="form-group"><label>Cu (Copper)</label><input type="number" step="any" id="cu" required></div>
          <div class="form-group"><label>Mn (Manganese)</label><input type="number" step="any" id="Mn" required></div>
          <div class="form-group"><label>B (Boron)</label><input type="number" step="any" id="B" required></div>
        </div>
        <button type="submit" class="btn-submit">Analyze & Predict Fertility</button>
      </form>

      <div id="resultBox" class="result-box">
        <div id="statusBadge" class="status-badge">Fertility Status</div>
        <div style="font-size: 0.95rem; margin-bottom: 12px; color: #cbd5e1;">Confidence: <b id="confText" style="color:#fff;">0%</b></div>
        
        <div class="prob-bar">
          <div class="prob-label"><span>Less Fertile</span><span id="prob0">0%</span></div>
          <div class="bar-bg"><div id="bar0" class="bar-fill" style="width: 0%; background: #ef4444;"></div></div>
        </div>
        <div class="prob-bar">
          <div class="prob-label"><span>Fertile</span><span id="prob1">0%</span></div>
          <div class="bar-bg"><div id="bar1" class="bar-fill" style="width: 0%; background: #f59e0b;"></div></div>
        </div>
        <div class="prob-bar">
          <div class="prob-label"><span>Highly Fertile</span><span id="prob2">0%</span></div>
          <div class="bar-bg"><div id="bar2" class="bar-fill" style="width: 0%; background: #10b981;"></div></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const presets = [
      {N: 138, P: 8.6, K: 560, ph: 7.46, ec: 0.62, oc: 0.7, S: 5.9, zn: 0.24, fe: 0.31, cu: 0.77, Mn: 8.71, B: 0.11},
      {N: 276, P: 15.3, K: 263, ph: 7.37, ec: 0.45, oc: 0.63, S: 6.6, zn: 0.81, fe: 2.74, cu: 0.77, Mn: 10.15, B: 0.29},
      {N: 339, P: 31.0, K: 540, ph: 7.35, ec: 0.8, oc: 1.05, S: 7.8, zn: 1.13, fe: 3.25, cu: 1.26, Mn: 13.99, B: 0.44}
    ];

    function setPreset(idx) {
      const p = presets[idx];
      for (const key in p) {
        document.getElementById(key).value = p[key];
      }
    }

    setPreset(0);

    document.getElementById('soilForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const keys = ['N','P','K','ph','ec','oc','S','zn','fe','cu','Mn','B'];
      const payload = {};
      keys.forEach(k => payload[k] = parseFloat(document.getElementById(k).value));

      try {
        const res = await fetch('/predict', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.status === 'success') {
          const resBox = document.getElementById('resultBox');
          resBox.classList.add('active');
          const badge = document.getElementById('statusBadge');
          badge.textContent = data.fertility_status;
          badge.className = 'status-badge badge-' + data.class_index;
          document.getElementById('confText').textContent = data.confidence + '%';
          
          document.getElementById('prob0').textContent = data.probabilities['Less Fertile'] + '%';
          document.getElementById('bar0').style.width = data.probabilities['Less Fertile'] + '%';
          
          document.getElementById('prob1').textContent = data.probabilities['Fertile'] + '%';
          document.getElementById('bar1').style.width = data.probabilities['Fertile'] + '%';
          
          document.getElementById('prob2').textContent = data.probabilities['Highly Fertile'] + '%';
          document.getElementById('bar2').style.width = data.probabilities['Highly Fertile'] + '%';
        } else {
          alert('Error: ' + data.message);
        }
      } catch (err) {
        alert('Request failed: ' + err.message);
      }
    });
  </script>
</body>
</html>
"""

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_PAGE.encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/predict":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
                result = classifier.compute_prediction(data)
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=8000):
    global classifier
    print("Loading Soil Quality Classifier...")
    classifier = SoilQualityClassifier()
    server_address = ("", port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"\n=======================================================")
    print(f"  Soil Fertility App running at: http://localhost:{port}")
    print(f"  Press Ctrl+C to stop the server.")
    print(f"=======================================================\n")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()

