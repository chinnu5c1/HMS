from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Simple file-based storage
DOCTORS_FILE = 'doctors.json'
APPOINTMENTS_FILE = 'appointments.json'

def load_doctors():
    if os.path.exists(DOCTORS_FILE):
        with open(DOCTORS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_doctors(doctors):
    with open(DOCTORS_FILE, 'w') as f:
        json.dump(doctors, f)

def load_appointments():
    if os.path.exists(APPOINTMENTS_FILE):
        with open(APPOINTMENTS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_appointments(appointments):
    with open(APPOINTMENTS_FILE, 'w') as f:
        json.dump(appointments, f)

# Doctor endpoints
@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    doctors = load_doctors()
    return jsonify(doctors)

@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    data = request.json
    doctors = load_doctors()
    
    new_doctor = {
        'id': len(doctors) + 1,
        'name': data['name'],
        'department': data['department'],
        'experience': data['experience'],
        'availableSlots': data['availableSlots'],
        'specialization': data.get('specialization', '')
    }
    
    doctors.append(new_doctor)
    save_doctors(doctors)
    
    return jsonify(new_doctor), 201

@app.route('/api/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    doctors = load_doctors()
    doctor = next((d for d in doctors if d['id'] == doctor_id), None)
    
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    
    return jsonify(doctor)

@app.route('/api/doctors/login', methods=['POST'])
def login_doctor():
    data = request.json or {}
    name = (data.get('name') or '').strip().lower()
    department = (data.get('department') or '').strip().lower()

    if not name or not department:
        return jsonify({'error': 'Name and department are required'}), 400

    doctors = load_doctors()
    match = next((d for d in doctors if (d.get('name', '').strip().lower() == name and d.get('department', '').strip().lower() == department)), None)

    if not match:
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({
        'id': match['id'],
        'name': match['name'],
        'department': match['department']
    })

# Appointment endpoints
@app.route('/api/appointments', methods=['GET'])
def get_appointments():
    appointments = load_appointments()
    return jsonify(appointments)

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.json
    appointments = load_appointments()
    
    # Validate patient exists (inter-service communication)
    try:
        patient_response = requests.get(f'http://localhost:5001/api/patients/{data["patientId"]}')
        if patient_response.status_code != 200:
            return jsonify({'error': 'Patient not found'}), 400
        patient = patient_response.json()
    except:
        # Fallback if patient service is not available
        patient = {'name': data.get('patientName', 'Unknown Patient')}
    
    # Validate doctor exists
    doctors = load_doctors()
    doctor = next((d for d in doctors if d['id'] == data['doctorId']), None)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 400
    
    # Check if time slot is available
    existing_appointments = [a for a in appointments 
                           if a['doctorId'] == data['doctorId'] 
                           and a['appointmentDate'] == data['appointmentDate']
                           and a['appointmentTime'] == data['appointmentTime']
                           and a['status'] != 'cancelled']
    
    if existing_appointments:
        return jsonify({'error': 'Time slot not available'}), 400
    
    new_appointment = {
        'id': len(appointments) + 1,
        'patientId': data['patientId'],
        'patientName': patient['name'],
        'doctorId': data['doctorId'],
        'doctorName': doctor['name'],
        'department': doctor['department'],
        'appointmentDate': data['appointmentDate'],
        'appointmentTime': data['appointmentTime'],
        'status': 'confirmed'
    }
    
    appointments.append(new_appointment)
    save_appointments(appointments)
    
    return jsonify(new_appointment), 201

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    appointments = load_appointments()
    appointment_index = next((i for i, a in enumerate(appointments) if a['id'] == appointment_id), None)
    
    if appointment_index is None:
        return jsonify({'error': 'Appointment not found'}), 404
    
    data = request.json
    appointments[appointment_index].update(data)
    
    save_appointments(appointments)
    return jsonify(appointments[appointment_index])

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'appointment-service'})

if __name__ == '__main__':
    app.run(debug=True, port=5002)