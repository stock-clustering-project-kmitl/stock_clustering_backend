from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import json
import numpy as np
import pandas as pd
from sklearn.cluster import MeanShift, AgglomerativeClustering, AffinityPropagation, DBSCAN, KMeans
from hdbscan import HDBSCAN
from sklearn.mixture import GaussianMixture
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score
from scipy.spatial.distance import euclidean
from werkzeug.exceptions import HTTPException  # NEW: Import HTTPException

app = Flask(__name__)
CORS(app)  # Enable CORS


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
        X = df.drop(columns=['stock_name']).apply(pd.to_numeric, errors='coerce').fillna(0).values
    else:
        X = df.apply(pd.to_numeric, errors='coerce').fillna(0).values
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
        perplexity = min(30, len(X) - 1)  # Ensure perplexity is less than the number of samples
        tsne = TSNE(n_components=n_components, perplexity=perplexity, random_state=42)
        return tsne.fit_transform(X), tsne
    else:
        return X, None
    
def convert_to_serializable(value):
        if isinstance(value, np.float32):
            return float(value)  # Convert NumPy float32 to native Python float
        if isinstance(value, np.ndarray):
            return value.tolist()  # Convert NumPy arrays to lists
        return value  # Return the value as is if it's already serializable
def error_response(message, code=400):
    return jsonify({"status": "error", "message": message}), code

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return error_response(e.description, e.code)
    return error_response("Internal server error: " + str(e), 500)

cluster_params = load_json('./shared/constants/cluster_parameter.json')

# Route to handle clustering requests
@app.route('/cluster', methods=['POST'])
def cluster_stocks():
    data = request.json
    year = data.get('year')
    algorithm = data.get('algorithm')
    hasNull = data['file_path'].split('/')[2]
    use_best_params = data.get('use_best_params', False)
    score_method = data.get('score_method', 'silhouette')  # 'silhouette', 'calinski_harabasz', or 'davies_bouldin'
    params = cluster_params[algorithm][year][hasNull][score_method]if use_best_params else data.get('params', {})
    reduce_method = data.get('reduce_method', 'none')  # 'pca', 'tsne', or 'none'
    n_components = data.get('n_components', 2)  # Number of components for reduction
    stock_symbols = data.get('stock_symbols', [])  # List of stock symbols to cluster

    print(params)

    # Load stock data
    stock_data = load_json(data['file_path'])
    df, X = preprocess_data(stock_data, year)

    if X.size == 0:
        return error_response("No data available for the selected year.")

    # Filter data based on provided stock symbols
    if stock_symbols:
        df = df[df['stock_name'].isin(stock_symbols)]
        if df.empty:
            return error_response("No data available for the provided stock symbols.")
        X = df.drop(columns=['stock_name']).apply(pd.to_numeric, errors='coerce').fillna(0).values

    # Reduce dimensionality if needed
    if reduce_method != 'none':
        X, _ = reduce_dimension(X, method=reduce_method, n_components=n_components)

    random_seed = 42  # Set a random seed for reproducibility
    try:
        if algorithm == 'kmeans':
            model = KMeans(random_state=random_seed, **params)
        elif algorithm == 'dbscan':
            model = DBSCAN(**params)
        elif algorithm == 'affinity_propagation':
            model = AffinityPropagation(random_state=random_seed, **params)
        elif algorithm == 'hdbscan':
            model = HDBSCAN(**params)
        elif algorithm == 'meanshift':
            model = MeanShift(**params)
        elif algorithm == 'agglomerative':
            model = AgglomerativeClustering(**params)
        elif algorithm == 'gaussian_mixture':
            model = GaussianMixture(random_state=random_seed, **params)
        else:
            return error_response("Unsupported algorithm.")
    except TypeError as e:
        return error_response(f"Parameter type error: {e}")

    labels = model.fit_predict(X)

    data_with_scores_and_clusters = {
        df.iloc[i]['stock_name']: {
            **{k: convert_to_serializable(v) for k, v in df.iloc[i].to_dict().items()},
            "cluster": int(labels[i]),
            "reduced_dimensions": X[i].tolist()  # Add reduced dimensions to the response
        } for i in range(len(df))
    }
    
    response = {
        "data": data_with_scores_and_clusters,
        "params": params,
    }
    return jsonify(response)
    


@app.route('/nearest_stocks', methods=['POST'])
def nearest_stocks():
    try:
        data = request.json
        stock_name = data.get('stock_name')
        year = data.get('year')
        algorithm = data.get('algorithm')
        hasNull = data['file_path'].split('/')[2]
        score_method = data.get('score_method', 'composite')
        use_best_params = data.get('use_best_params', False)
        params = cluster_params[algorithm][year][hasNull][score_method] if use_best_params else data.get('params', {})
        number_of_stock = data.get('number_of_stock', 1)  # Number of nearest stocks to return

        # Load stock data
        stock_data = load_json(data['file_path'])
        df, X = preprocess_data(stock_data, year)
        if X.size == 0:
            return error_response("No data available for the selected year.")
        
        reduce_method = data.get('reduce_method', 'none')
        n_components = data.get('n_components', 2)
        if reduce_method != 'none':
            X, _ = reduce_dimension(X, method=reduce_method, n_components=n_components)
        
        random_seed = 42  # Set a random seed for reproducibility
        try:
            # ...existing clustering setup code...
            if algorithm == 'kmeans':
                model = KMeans(random_state=random_seed, **params)
            elif algorithm == 'dbscan':
                model = DBSCAN(**params)
            elif algorithm == 'affinity_propagation':
                model = AffinityPropagation(random_state=random_seed, **params)
            elif algorithm == 'hdbscan':
                model = HDBSCAN(**params)
            elif algorithm == 'meanshift':
                model = MeanShift(**params)
            elif algorithm == 'agglomerative':
                model = AgglomerativeClustering(**params)
            elif algorithm == 'gaussian_mixture':
                model = GaussianMixture(random_state=random_seed, **params)
            else:
                return error_response("Unsupported algorithm.")
        except TypeError as e:
            return error_response(f"Parameter error: {e}")
        
        labels = model.fit_predict(X)

        target_index = df[df['stock_name'] == stock_name].index
        if target_index.empty:
            return error_response("Stock not found.")

        target_index = target_index[0]
        target_cluster = labels[target_index]
        same_cluster_indices = [i for i, label in enumerate(labels) if label == target_cluster and i != target_index]
        if not same_cluster_indices:
            return error_response("No other stocks in the same cluster.")

        target_vector = X[target_index]
        nearest_indices = sorted(same_cluster_indices, key=lambda i: euclidean(target_vector, X[i]))[:number_of_stock]
        nearest_stocks = [{
            "stock_name": df.iloc[i]['stock_name'],
            "distance": euclidean(target_vector, X[i]),
            "cluster": int(labels[i])
        } for i in nearest_indices]

        response = {
            "nearest_stocks": nearest_stocks,
            "target_cluster": int(target_cluster)
        }
        return jsonify(response)
    except Exception as err:
        return error_response(str(err), 500)
    

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)