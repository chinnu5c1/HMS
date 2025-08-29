import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Doctor {
  id?: number;
  name: string;
  department: string;
  experience: number;
  availableSlots: string[];
  specialization?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:5002/api';
  private doctorsSubject = new BehaviorSubject<Doctor[]>([]);
  public doctors$ = this.doctorsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadDoctors();
  }

  private loadDoctors(): void {
    // Load from localStorage as fallback
    const stored = localStorage.getItem('doctors');
    if (stored) {
      this.doctorsSubject.next(JSON.parse(stored));
    }

    // Try to load from API
    this.getDoctors().subscribe(
      doctors => {
        this.doctorsSubject.next(doctors);
        localStorage.setItem('doctors', JSON.stringify(doctors));
      },
      error => {
        console.warn('API not available, using local storage');
        // Initialize with sample doctors if nothing in storage
        if (!stored) {
          this.initializeSampleDoctors();
        }
      }
    );
  }

  private initializeSampleDoctors(): void {
    const sampleDoctors: Doctor[] = [
      {
        id: 1,
        name: 'Dr. Sarah Wilson',
        department: 'Cardiology',
        experience: 15,
        availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'],
        specialization: 'Heart Surgery'
      },
      {
        id: 2,
        name: 'Dr. Michael Chen',
        department: 'Orthopedics',
        experience: 12,
        availableSlots: ['08:00', '09:00', '13:00', '14:00', '16:00'],
        specialization: 'Joint Replacement'
      },
      {
        id: 3,
        name: 'Dr. Emily Rodriguez',
        department: 'Pediatrics',
        experience: 8,
        availableSlots: ['10:00', '11:00', '15:00', '16:00', '17:00'],
        specialization: 'Child Development'
      }
    ];
    this.doctorsSubject.next(sampleDoctors);
    localStorage.setItem('doctors', JSON.stringify(sampleDoctors));
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`);
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/doctors/${id}`);
  }

  createDoctor(doctor: Doctor): Observable<Doctor> {
    return new Observable(observer => {
      this.http.post<Doctor>(`${this.apiUrl}/doctors`, doctor).subscribe(
        result => {
          this.loadDoctors();
          observer.next(result);
          observer.complete();
        },
        error => {
          // Fallback to local storage
          const doctors = this.doctorsSubject.value;
          const newDoctor = { ...doctor, id: Date.now() };
          const updatedDoctors = [...doctors, newDoctor];
          this.doctorsSubject.next(updatedDoctors);
          localStorage.setItem('doctors', JSON.stringify(updatedDoctors));
          observer.next(newDoctor);
          observer.complete();
        }
      );
    });
  }

  getCurrentDoctors(): Doctor[] {
    return this.doctorsSubject.value;
  }
}