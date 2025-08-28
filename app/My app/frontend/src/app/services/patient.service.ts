import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Patient {
  id?: number;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  registrationDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:5001/api';
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPatients();
  }

  private loadPatients(): void {
    // Load from localStorage as fallback
    const stored = localStorage.getItem('patients');
    if (stored) {
      this.patientsSubject.next(JSON.parse(stored));
    }

    // Try to load from API
    this.getPatients().subscribe(
      patients => {
        this.patientsSubject.next(patients);
        localStorage.setItem('patients', JSON.stringify(patients));
      },
      error => {
        console.warn('API not available, using local storage');
      }
    );
  }

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/patients`);
  }

  getPatient(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/patients/${id}`);
  }

  createPatient(patient: Patient): Observable<Patient> {
    return new Observable(observer => {
      this.http.post<Patient>(`${this.apiUrl}/patients`, patient).subscribe(
        result => {
          this.loadPatients();
          observer.next(result);
          observer.complete();
        },
        error => {
          // Fallback to local storage
          const patients = this.patientsSubject.value;
          const newPatient = { ...patient, id: Date.now(), registrationDate: new Date().toISOString() };
          const updatedPatients = [...patients, newPatient];
          this.patientsSubject.next(updatedPatients);
          localStorage.setItem('patients', JSON.stringify(updatedPatients));
          observer.next(newPatient);
          observer.complete();
        }
      );
    });
  }

  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return new Observable(observer => {
      this.http.put<Patient>(`${this.apiUrl}/patients/${id}`, patient).subscribe(
        result => {
          this.loadPatients();
          observer.next(result);
          observer.complete();
        },
        error => {
          // Fallback to local storage
          const patients = this.patientsSubject.value;
          const index = patients.findIndex(p => p.id === id);
          if (index !== -1) {
            patients[index] = { ...patient, id };
            this.patientsSubject.next(patients);
            localStorage.setItem('patients', JSON.stringify(patients));
            observer.next(patients[index]);
          }
          observer.complete();
        }
      );
    });
  }

  deletePatient(id: number): Observable<void> {
    return new Observable(observer => {
      this.http.delete<void>(`${this.apiUrl}/patients/${id}`).subscribe(
        () => {
          this.loadPatients();
          observer.complete();
        },
        error => {
          // Fallback to local storage
          const patients = this.patientsSubject.value.filter(p => p.id !== id);
          this.patientsSubject.next(patients);
          localStorage.setItem('patients', JSON.stringify(patients));
          observer.complete();
        }
      );
    });
  }

  getCurrentPatients(): Patient[] {
    return this.patientsSubject.value;
  }
}