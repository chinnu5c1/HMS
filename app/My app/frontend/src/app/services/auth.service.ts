import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface PatientProfile { id: number; name: string; mobile: string }
interface DoctorProfile { id: number; name: string; department: string }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private patientApi = 'http://localhost:5001/api';
  private doctorApi = 'http://localhost:5002/api';

  private currentPatientSubject = new BehaviorSubject<PatientProfile | null>(this.readLocal<PatientProfile>('currentPatient'));
  private currentDoctorSubject = new BehaviorSubject<DoctorProfile | null>(this.readLocal<DoctorProfile>('currentDoctor'));

  public currentPatient$ = this.currentPatientSubject.asObservable();
  public currentDoctor$ = this.currentDoctorSubject.asObservable();

  constructor(private http: HttpClient) {}

  loginPatient(name: string, mobile: string): Observable<PatientProfile> {
    return new Observable(observer => {
      this.http.post<PatientProfile>(`${this.patientApi}/patients/login`, { name, mobile }).subscribe({
        next: (profile) => {
          this.currentPatientSubject.next(profile);
          this.writeLocal('currentPatient', profile);
          observer.next(profile);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        }
      });
    });
  }

  logoutPatient(): void {
    this.currentPatientSubject.next(null);
    localStorage.removeItem('currentPatient');
  }

  loginDoctor(name: string, department: string): Observable<DoctorProfile> {
    return new Observable(observer => {
      this.http.post<DoctorProfile>(`${this.doctorApi}/doctors/login`, { name, department }).subscribe({
        next: (profile) => {
          this.currentDoctorSubject.next(profile);
          this.writeLocal('currentDoctor', profile);
          observer.next(profile);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
          observer.complete();
        }
      });
    });
  }

  logoutDoctor(): void {
    this.currentDoctorSubject.next(null);
    localStorage.removeItem('currentDoctor');
  }

  private readLocal<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private writeLocal(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
