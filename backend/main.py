# backend/main.py
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
from sklearn.cluster import KMeans

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔒 tighten for prod
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/cluster")
async def cluster_customers(file: UploadFile = File(...), n_clusters: int = Form(3)):
    try:
        df = pd.read_csv(file.file)

        if df.select_dtypes(include='number').shape[1] < 2:
            return {"error": "Please upload a file with at least 2 numerical columns."}

        X = df.select_dtypes(include='number').dropna()

        kmeans = KMeans(n_clusters=n_clusters, n_init=10)
        kmeans.fit(X)

        df['Segment'] = kmeans.labels_

        summary = df.groupby("Segment").mean(numeric_only=True).round(2).to_dict()

        return {
            "segments": summary,
            "columns": list(X.columns),
            "n_clusters": n_clusters
        }

    except Exception as e:
        return {"error": str(e)}
