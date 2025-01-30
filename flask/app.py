import os
import librosa
import numpy as np
import soundfile as sf
from flask import Flask, request, jsonify
from sklearn.metrics.pairwise import cosine_similarity
from scipy.stats import skew, kurtosis
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def safe_stats(feature):
    """
    Safely compute statistics and ensure output is flattened
    """
    try:
        axis = 1 if feature.ndim > 1 else 0
        mean_val = np.mean(feature, axis=axis)
        std_val = np.std(feature, axis=axis)
        skew_val = skew(feature, axis=axis) if feature.ndim > 1 else skew(feature)
        kurt_val = kurtosis(feature, axis=axis) if feature.ndim > 1 else kurtosis(feature)
        stats = np.hstack([mean_val, std_val, skew_val, kurt_val])
        return np.nan_to_num(stats, nan=0.0)
    except Exception as e:
        print(f"Error computing statistics: {str(e)}")
        return np.zeros(4)

def extract_enhanced_features(audio_path):
    """
    Extract multiple audio features with proper dimensionality handling
    """
    try:
        y, sr = librosa.load(audio_path, sr=None)
        if len(y) == 0:
            raise ValueError("Empty audio file")
        y = librosa.util.normalize(y)
        
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        zero_crossing = librosa.feature.zero_crossing_rate(y)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
        rms = librosa.feature.rms(y=y)
        
        features = []
        for feature in [mfcc, spectral_centroid, chroma, zero_crossing, spectral_rolloff, rms]:
            feature_stats = safe_stats(feature)
            features.append(feature_stats)
        
        combined_features = np.concatenate(features)
        
        if np.any(np.isnan(combined_features)):
            raise ValueError("NaN values in final feature vector")
            
        return combined_features
        
    except Exception as e:
        raise ValueError(f"Feature extraction failed: {str(e)}")

def compare_audio_files(audio1, audio2):
    """
    Compare two audio files and return similarity metrics
    """
    try:
        features1 = extract_enhanced_features(audio1)
        features2 = extract_enhanced_features(audio2)
        
        if len(features1) != len(features2):
            raise ValueError(f"Feature vectors have different lengths: {len(features1)} vs {len(features2)}")
        
        # Calculate cosine similarity
        cosine_sim = float(cosine_similarity([features1], [features2])[0][0])
        
        # Calculate Euclidean distance (normalized)
        euclidean_dist = float(np.linalg.norm(features1 - features2))
        max_dist = float(np.sqrt(len(features1)))
        euclidean_sim = float(1 - (euclidean_dist / max_dist))
        
        # Original similarity calculation
        combined_similarity = float(0.7 * cosine_sim + 0.3 * euclidean_sim)
        
        # Original sigmoid function
        def sigmoid(x, k=12):
            return float(1 / (1 + np.exp(-k * (x - 0.5))))
        
        final_similarity = sigmoid(combined_similarity)
        
        # Convert to percentage, keeping scientific notation if very small
        similarity_percentage = float(final_similarity * 100)
        
        return {
            'similarity_percentage': similarity_percentage,
            'is_plagiarized': similarity_percentage > 75
        }
        
    except Exception as e:
        raise ValueError(f"Comparison failed: {str(e)}")

@app.route('/detect_plagiarism', methods=['POST'])
def detect_plagiarism():
    if 'file1' not in request.files or 'file2' not in request.files:
        return jsonify({'error': 'Both audio files are required'}), 400
    
    file1 = request.files['file1']
    file2 = request.files['file2']
    
    path1 = f"temp1.wav"
    path2 = f"temp2.wav"
    
    try:
        file1.save(path1)
        file2.save(path2)
        
        if os.path.getsize(path1) == 0 or os.path.getsize(path2) == 0:
            raise ValueError("One or both audio files are empty")
        
        result = compare_audio_files(path1, path2)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        for path in [path1, path2]:
            if os.path.exists(path):
                os.remove(path)

if __name__ == '__main__':
    app.run(debug=True)