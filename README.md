# 🔐 Crypto Fraud Detection using Graph Neural Networks (GNN)

> A scalable blockchain fraud detection system that leverages **Graph Neural Networks** to identify suspicious wallet activity and risky transactions based on network relationships.

---

## 📌 Overview

Traditional fraud detection models analyze transactions in isolation. This project takes a fundamentally different approach — it models the entire blockchain as a **graph**:

| Element | Representation |
|--------|----------------|
| 🟢 Wallet Addresses | Nodes |
| 🔗 Transactions | Edges |

By capturing the **network structure** of blockchain activity, the system uncovers hidden fraud patterns that transaction-level models would miss entirely.

---

## 🧠 Key Features

- 🔍 **Graph-based fraud detection** using Graph Convolutional Networks (GCN)
- ⚡ **Subgraph-based inference** for scalability on massive graphs (~3M nodes, ~13M edges)
- 🌐 **FastAPI backend** for low-latency ML serving
- 🔗 **Spring Boot integration** via a clean microservice architecture
- 📊 **Transaction trace graph visualization** for explainability
- 🧩 Designed to handle **large-scale, production-grade graphs**

---

## 🏗️ System Architecture

```
┌─────────────┐
│  Frontend   │
│    (UI)     │
└──────┬──────┘
       │
┌──────▼──────────────┐
│  Spring Boot Backend │
│  (Microservice)      │
└──────┬───────────────┘
       │
┌──────▼──────────────┐
│  FastAPI ML Service  │
│  (REST API)          │
└──────┬───────────────┘
       │
┌──────▼──────────────────────────┐
│  GNN Model (PyTorch Geometric)  │
│  Graph Convolutional Network     │
└─────────────────────────────────┘
```

---

## ⚙️ How It Works

### 1️⃣ Graph Construction

Raw blockchain transaction data is loaded and converted into a graph structure using **NetworkX**. Each wallet address becomes a node enriched with the following features:

- In-degree (number of incoming transactions)
- Out-degree (number of outgoing transactions)
- Total incoming amount
- Total outgoing amount

### 2️⃣ GNN Model

A **Graph Convolutional Network (GCN)** is trained to learn fraud patterns by aggregating information from a wallet's direct neighbors and its wider network context. The model outputs a **fraud probability** for each wallet node.

### 3️⃣ Inference Pipeline

```
Input: fromAddress + toAddress
        │
        ▼
Extract k-hop subgraph around both addresses
        │
        ▼
Run GCN on extracted subgraph
        │
        ▼
Output: Sender Risk | Receiver Risk | Transaction Risk
```

---

## 📊 API Reference

### Endpoint

```
POST /predict
```

### Request Body

```json
{
  "fromAddress": "0xabc...",
  "toAddress": "0xdef...",
  "k_hops": 2
}
```

### Response

```json
{
  "from": {
    "probability": 0.23,
    "label": "Not Fraud"
  },
  "to": {
    "probability": 0.78,
    "label": "Fraud"
  },
  "transaction": {
    "probability": 0.81,
    "label": "Fraud"
  }
}
```

### Interactive Docs

Once the server is running, visit:

```
http://localhost:8000/docs
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- CUDA-compatible GPU (recommended for large graphs)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/crypto-fraud-gnn.git
cd crypto-fraud-gnn
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the API Server

```bash
uvicorn serve_model:app --host 0.0.0.0 --port 8000
```

### 4. Open Swagger UI

```
http://localhost:8000/docs
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Framework | PyTorch + PyTorch Geometric |
| Graph Processing | NetworkX |
| ML Serving | FastAPI |
| Backend Integration | Spring Boot |
| Communication | REST APIs |
| Language | Python |

---

## ⚠️ Known Challenges

- **Context-dependent predictions** — GNN outputs depend on the subgraph structure, making results sensitive to neighborhood composition.
- **Large graph memory constraints** — Graphs with millions of nodes require careful batching and subgraph sampling strategies.
- **Overconfident probability outputs** — The model may require calibration to produce reliable probability estimates.

---

## 🔮 Future Scope

- [ ] **Explainable AI** — Integrate GNNExplainer to highlight which neighbors drive fraud predictions
- [ ] **Real-time fraud detection** — Stream-based inference on live blockchain data
- [ ] **Temporal graph learning** — Model transaction patterns over time using dynamic graphs
- [ ] **Risk scoring system** — Multi-tier risk levels beyond binary fraud/non-fraud
- [ ] **Interactive visualization dashboard** — Explore transaction graphs in a browser UI

---

## 💡 Key Insight

> **Fraud detection is inherently relational.**
>
> A wallet's risk is not just about what it does — it's about *who it transacts with*. Graph Neural Networks capture this relational context naturally, making them uniquely suited for blockchain fraud detection.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.