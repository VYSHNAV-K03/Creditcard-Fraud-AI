from flask import Flask, request, jsonify
from fraud_model import predict_fraud  # Import your function
import torch
from flask_cors import CORS

app = Flask(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    print("data",data)
    try:
        prediction = predict_fraud(
            Transaction_ID=data['Transaction_ID'],
            Date=data['Date'],
            Time=data['Time'],
            Amount=float(data['Amount']),
            Merchant=data['Merchant'],
            Cardholder_Name=data['Cardholder_Name'],
            Card_Number=data['Card_Number']
        )
        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
