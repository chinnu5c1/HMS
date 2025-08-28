import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Appointment {
  id?: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  department?: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5002/api';
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  public appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    // Load from localStorage as fallback
    const stored = localStorage.getItem('appointments');
    if (stored) {
      this.appointmentsSubject.next(JSON.parse(stored));
    }

    // Try to load from API
    this.getAppointments().subscribe(
      appointments => {
        this.appointmentsSubject.next(appointments);
        localStorage.setItem('appointments', JSON.stringify(appointments));
      },
      error => {
        console.warn('API not available, using local storage');
      }
    );
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`);
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return new Observable(observer => {
      const appointments = this.appointmentsSubject.value.filter(a => a.patientId === patientId);
      observer.next(appointments);
      observer.complete();
    });
  }

  getAppointmentsByDoctor(doctorId: number): Observable<Appointment[]> {
    return new Observable(observer => {
      const appointments = this.appointmentsSubject.value.filter(a => a.doctorId === doctorId);
      observer.next(appointments);
      observer.complete();
    });
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return new Observable(observer => {
      this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointment).subscribe(
        result => {
          this.loadAppointments();
          observer.next(result);
          observer.complete();
        },
        error => {
          // Fallback to local storage
          const appointments = this.appointmentsSubject.value;
          const newAppointment = { 
            ...appointment, 
            id: Date.now(), 
            status: 'confirmed' as const
          };
          const updatedAppointments = [...appointments, newAppointment];
          this.appointmentsSubject.next(updatedAppointments);
          localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
          observer.next(newAppointment);
          observer.complete();
        }
      );
    });
  }

  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<Appointment> {
    return new Observable(observer => {
      this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, appointment).subscribe(
        result => {
          this.loadAppointments();
          observer.next(result);
          observer.complete();
        },
        error => {
          // Fallback to local storage
          const appointments = this.appointmentsSubject.value;
          const index = appointments.findIndex(a => a.id === id);
          if (index !== -1) {
            appointments[index] = { ...appointments[index], ...appointment };
            this.appointmentsSubject.next(appointments);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            observer.next(appointments[index]);
          }
          observer.complete();
        }
      );
    });
  }

  completeAppointment(id: number): Observable<Appointment> {
    return this.updateAppointment(id, { status: 'completed', notes: 'Thanks for consulting.' });
  }

  getCurrentAppointments(): Appointment[] {
    return this.appointmentsSubject.value;
  }

  isTimeSlotAvailable(doctorId: number, date: string, time: string): boolean {
    const appointments = this.appointmentsSubject.value;
    return !appointments.some(a => 
      a.doctorId === doctorId && 
      a.appointmentDate === date && 
      a.appointmentTime === time &&
      a.status !== 'cancelled'
    );
  }
}