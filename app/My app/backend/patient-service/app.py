from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simple file-based storage
DATA_FILE = 'patients.json'

def load_patients():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return []

def save_patients(patients):
    with open(DATA_FILE, 'w') as f:
        json.dump(patients, f)

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = load_patients()
    return jsonify(patients)

@app.route('/api/patients', methods=['POST'])
def create_patient():
    data = request.json
    patients = load_patients()
    
    new_patient = {
        'id': len(patients) + 1,
        'name': data['name'],
        'age': data['age'],
        'gender': data['gender'],
        'mobile': data['mobile'],
        'registrationDate': datetime.now().isoformat()
    }
    
    patients.append(new_patient)
    save_patients(patients)
    
    return jsonify(new_patient), 201

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    patients = load_patients()
    patient = next((p for p in patients if p['id'] == patient_id), None)
    
    if not patient:
        return jsonify({'error': 'Patient not found'}), 404
    
    return jsonify(patient)

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    patients = load_patients()
    patient_index = next((i for i, p in enumerate(patients) if p['id'] == patient_id), None)
    
    if patient_index is None:
        return jsonify({'error': 'Patient not found'}), 404
    
    data = request.json
    patients[patient_index].update({
        'name': data['name'],
        'age': data['age'],
        'gender': data['gender'],
        'mobile': data['mobile']
    })
    
    save_patients(patients)
    return jsonify(patients[patient_index])

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def delete_patient(patient_id):
    patients = load_patients()
    patients = [p for p in patients if p['id'] != patient_id]
    save_patients(patients)
    
    return '', 204

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'patient-service'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)