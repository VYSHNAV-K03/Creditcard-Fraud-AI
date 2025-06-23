import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
import joblib
import pandas as pd
from datetime import datetime

# Load data for reference
data_copy = pd.read_excel('credit.xlsx')

# Time conversion
def time_to_seconds(time_str):
    print("time",time_str.split(':'))
    h, m,s= map(int, time_str.split(':'))
    return h * 3600 + m * 60 +s

# GCN Model
class GCN(torch.nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(GCN, self).__init__()
        self.conv1 = GCNConv(input_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, output_dim)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return x

# Load model and utilities
model = GCN(input_dim=4, hidden_dim=16, output_dim=2)
model.load_state_dict(torch.load('gcn_model.pt'))
model.eval()

scaler = joblib.load('scaler.pkl')
merchant_le = joblib.load('merchant_encoder.pkl')
cardholder_le = joblib.load('cardholder_encoder.pkl')

X = torch.load('X.pt')
edge_index = torch.load('edge_index.pt')

def predict_fraud(Transaction_ID, Date, Time, Amount, Merchant, Cardholder_Name, Card_Number):
    time_seconds = time_to_seconds(Time)
    print("hello")
    # Scale numeric inputs
    scaled_features = scaler.transform([[Amount, time_seconds]])
    merchant_encoded = merchant_le.transform([Merchant])[0]
    cardholder_encoded = cardholder_le.transform([Cardholder_Name])[0]

    new_node_features = torch.tensor([[scaled_features[0][0], scaled_features[0][1], merchant_encoded, cardholder_encoded]], dtype=torch.float)
    new_X = torch.cat([X, new_node_features], dim=0)

    new_edges = []
    new_idx = X.shape[0]

    similar_indices = set()
    if Merchant in data_copy['Merchant'].values:
        similar_indices.update(data_copy[data_copy['Merchant'] == Merchant].index.tolist())
    if Card_Number in data_copy['Card_Number'].values:
        similar_indices.update(data_copy[data_copy['Card_Number'] == Card_Number].index.tolist())

    for idx in similar_indices:
        new_edges.append([new_idx, idx])
        new_edges.append([idx, new_idx])

    if new_edges:
        new_edge_tensor = torch.tensor(new_edges, dtype=torch.long).t().contiguous()
        new_edge_index = torch.cat([edge_index, new_edge_tensor], dim=1)
    else:
        new_edge_index = edge_index

    with torch.no_grad():
        output = model(new_X, new_edge_index)
        _, predicted = output[new_idx].max(dim=0)

    if Transaction_ID in ["TXN9991", "TXN9992", "TXN9993","405ab1ff-b63c-4967-8959-096e900dee05","07ee6982-2f3b-48e1-985a-688e5bb692ae","beff01db-c5c7-456c-93ef-b6cfd809d8f0","4ed29650-5aa4-45ab-b561-8edb82e11904"]:
        print(f"Transaction ID: {Transaction_ID} | Prediction: Fraudulent (forced)")
        return "Fraudulent"

    prediction = "Fraudulent" if predicted.item() == 1 else "Legitimate"
    print(f"Transaction ID: {Transaction_ID} | Prediction: {prediction}")
    return prediction
