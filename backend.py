from flask import Flask, request, jsonify
import json
import numpy as np
import pandas as pd
from sklearn.cluster import MeanShift, AgglomerativeClustering, AffinityPropagation, DBSCAN, KMeans
from hdbscan import HDBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score

app = Flask(__name__)

# Helper functions
def load_json(filename):
    with open(filename, 'r') as file:
        return json.load(file)

def safe_float(value, default=0):
    try:
        return float(value)
    except ValueError:
        return default

def preprocess_data(stock_data, year):
    records = [
        {
            'stock_name': stock['symbol'],
            'year': stock['year'],
            'quarter': stock['quarter'],
            'ebitMargin': safe_float(stock.get('ebitMargin', 0)),
            'operatingCFMargin': safe_float(stock.get('operatingCFMargin', 0)),
            'investingCFMargin': safe_float(stock.get('investingCFMargin', 0)),
            'financingCFMargin': safe_float(stock.get('financingCFMargin', 0)),
            'roe': safe_float(stock.get('roe', 0)),
            'roa': safe_float(stock.get('roa', 0)),
            'netProfitMarginAccum': safe_float(stock.get('netProfitMarginAccum', 0)),
            'de': safe_float(stock.get('de', 0)),
            'fixedAssetTurnover': safe_float(stock.get('fixedAssetTurnover', 0)),
            'totalAssetTurnover': safe_float(stock.get('totalAssetTurnover', 0)),
            'pe': safe_float(stock.get('pe', 0)),
            'pbv': safe_float(stock.get('pbv', 0)),
            'bvps': safe_float(stock.get('bvps', 0)),
            'dividendYield': safe_float(stock.get('dividendYield', 0))
        }
        for stock in stock_data if stock['year'] == year
    ]
    df = pd.DataFrame(records)
    if 'stock_name' in df.columns:
        X = df.drop(columns=['stock_name']).values
    else:
        X = df.values
    return df, X

def reduce_dimension(X, method='pca', n_components=2):
    """
    Reduces the dimensionality of the feature set X using PCA or t-SNE.
    If 'pca', will reduce to n_components (default 2).
    If 'tsne', will reduce to 2 or 3 dimensions.
    """
    if method == 'pca':
        pca = PCA(n_components=n_components)
        return pca.fit_transform(X), pca
    elif method == 'tsne':
        tsne = TSNE(n_components=n_components, random_state=42)
        return tsne.fit_transform(X), tsne
    else:
        return X, None
    
def convert_to_serializable(value):
        if isinstance(value, np.float32):
            return float(value)  # Convert NumPy float32 to native Python float
        if isinstance(value, np.ndarray):
            return value.tolist()  # Convert NumPy arrays to lists
        return value  # Return the value as is if it's already serializable

# Route to handle clustering requests
@app.route('/cluster', methods=['POST'])
def cluster_stocks():
    data = request.json
    year = data.get('year')
    algorithm = data.get('algorithm')
    params = data.get('params', {})
    reduce_method = data.get('reduce_method', 'none')  # 'pca', 'tsne', or 'none'
    n_components = data.get('n_components', 2)  # Number of components for reduction

    # Load stock data
    stock_data = load_json(data['file_path'])
    df, X = preprocess_data(stock_data, year)

    if X.size == 0:
        return jsonify({"error": "No data available for the selected year."}), 400

    # Reduce dimensionality if needed
    if reduce_method != 'none':
        X, _ = reduce_dimension(X, method=reduce_method, n_components=n_components)

    # Select clustering algorithm
    if algorithm == 'kmeans':
        model = KMeans(**params)
    elif algorithm == 'dbscan':
        model = DBSCAN(**params)
    elif algorithm == 'affinity_propagation':
        model = AffinityPropagation(**params)
    elif algorithm == 'hdbscan':
        model = HDBSCAN(**params)
    elif algorithm == 'meanshift':
        model = MeanShift(**params)
    elif algorithm == 'agglomerative':
        model = AgglomerativeClustering(**params)
    elif algorithm == 'gaussian_mixture':
        model = GaussianMixture(**params)
    else:
        return jsonify({"error": "Unsupported algorithm."}), 400

    # Perform clustering
    labels = model.fit_predict(X)

    # Compute clustering scores
    scores = {
        "Silhouette Score": silhouette_score(X, labels) if len(set(labels)) > 1 else "N/A",
        "Calinski-Harabasz Index": calinski_harabasz_score(X, labels) if len(set(labels)) > 1 else "N/A",
        "Davies-Bouldin Index": davies_bouldin_score(X, labels) if len(set(labels)) > 1 else "N/A"
    }

    # Prepare response
    

    data_with_scores_and_clusters = {
        df.iloc[i]['stock_name']: {
            **{k: convert_to_serializable(v) for k, v in df.iloc[i].to_dict().items()},
            "cluster": int(labels[i]),
            "scores": {k: convert_to_serializable(v) for k, v in scores.items()},
            "reduced_dimensions": X[i].tolist()  # Add reduced dimensions to the response
        } for i in range(len(df))
    }

    response = {
        "data": data_with_scores_and_clusters
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
