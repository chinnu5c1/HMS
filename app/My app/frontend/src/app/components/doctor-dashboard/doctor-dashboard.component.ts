import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { AppointmentService, Appointment } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row">
        <!-- Doctor Login/Selection -->
        <div class="col-lg-4 mb-4">
          <div class="card doctor-card">
            <div class="card-header">
              <i class="bi bi-person-badge"></i> Doctor Login
            </div>
            <div class="card-body">
              <form (ngSubmit)="loginDoctor()" #loginForm="ngForm" *ngIf="!selectedDoctor">
                <div class="mb-3">
                  <label for="doctorLoginName" class="form-label">Doctor Name</label>
                  <input 
                    id="doctorLoginName"
                    class="form-control" 
                    [(ngModel)]="doctorLoginName" 
                    name="doctorLoginName"
                    required>
                </div>
                <div class="mb-3">
                  <label for="doctorLoginDept" class="form-label">Department</label>
                  <input 
                    id="doctorLoginDept"
                    class="form-control" 
                    [(ngModel)]="doctorLoginDept" 
                    name="doctorLoginDept"
                    required>
                </div>
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="!doctorLoginName || !doctorLoginDept">
                  <i class="bi bi-box-arrow-in-right"></i> Login
                </button>
              </form>

              <!-- Doctor Profile -->
              <div *ngIf="selectedDoctor">
                <div class="d-flex align-items-center mb-3">
                  <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" 
                       style="width: 60px; height: 60px;">
                    <i class="bi bi-person-badge fs-3"></i>
                  </div>
                  <div>
                    <h5 class="mb-1">{{ selectedDoctor.name }}</h5>
                    <p class="mb-0 text-muted">{{ selectedDoctor.department }}</p>
                  </div>
                </div>
                
                <div class="mb-3">
                  <small class="text-muted">Specialization:</small><br>
                  <strong>{{ selectedDoctor.specialization }}</strong>
                </div>
                
                <div class="mb-3">
                  <small class="text-muted">Experience:</small><br>
                  <span class="badge bg-info">{{ selectedDoctor.experience }} years</span>
                </div>
                
                <button 
                  class="btn btn-outline-secondary w-100"
                  (click)="logout()">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>
            </div>
          </div>

          <!-- Today's Stats -->
          <div class="card mt-4" *ngIf="selectedDoctor">
            <div class="card-header">
              <i class="bi bi-bar-chart"></i> Today's Summary
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-6">
                  <div class="bg-light p-3 rounded">
                    <h3 class="text-primary">{{ todayAppointments.length }}</h3>
                    <small class="text-muted">Total Appointments</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-light p-3 rounded">
                    <h3 class="text-success">{{ completedToday }}</h3>
                    <small class="text-muted">Completed</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appointments List -->
        <div class="col-lg-8" *ngIf="selectedDoctor">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-calendar-check"></i> My Appointments</span>
              <span class="badge bg-light text-dark">{{ doctorAppointments.length }} Total</span>
            </div>
            <div class="card-body">
              <div class="row" *ngIf="doctorAppointments.length > 0; else noAppointments">
                <div class="col-md-6 mb-4" *ngFor="let appointment of doctorAppointments">
                  <div class="card appointment-card h-100">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h6 class="card-title mb-1">{{ appointment.patientName }}</h6>
                          <small class="text-muted">Patient</small>
                        </div>
                        <span class="status-badge"
                              [ngClass]="{
                                'status-confirmed': appointment.status === 'confirmed',
                                'status-completed': appointment.status === 'completed'
                              }">
                          {{ appointment.status | titlecase }}
                        </span>
                      </div>
                      
                      <div class="mb-3">
                        <div class="row">
                          <div class="col-6">
                            <small class="text-muted">Date:</small><br>
                            <strong>{{ formatDate(appointment.appointmentDate) }}</strong>
                          </div>
                          <div class="col-6">
                            <small class="text-muted">Time:</small><br>
                            <span class="badge bg-info">{{ appointment.appointmentTime }}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-3" *ngIf="appointment.notes">
                        <small class="text-muted">Notes:</small><br>
                        <p class="mb-0 text-success">
                          <i class="bi bi-check-circle"></i> {{ appointment.notes }}
                        </p>
                      </div>
                      
                      <div class="d-flex gap-2">
                        <button 
                          class="btn btn-success btn-sm flex-fill"
                          *ngIf="appointment.status === 'confirmed'"
                          (click)="completeConsultation(appointment.id!)">
                          <i class="bi bi-check-circle"></i> Complete
                        </button>
                        <button 
                          class="btn btn-outline-info btn-sm flex-fill"
                          (click)="viewPatientDetails(appointment)">
                          <i class="bi bi-person"></i> Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <ng-template #noAppointments>
                <div class="text-center py-5">
                  <i class="bi bi-calendar-x display-1 text-muted"></i>
                  <h4 class="text-muted mt-3">No Appointments Scheduled</h4>
                  <p class="text-muted">Your appointments will appear here once patients book them.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>

        <!-- Welcome Message -->
        <div class="col-12" *ngIf="!selectedDoctor">
          <div class="card">
            <div class="card-body text-center py-5">
              <i class="bi bi-speedometer2 display-1 text-primary"></i>
              <h2 class="mt-3">Welcome to Doctor Dashboard</h2>
              <p class="text-muted">Please login using your name and department to view your appointments and manage consultations.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Alert -->
      <div class="alert alert-success alert-dismissible fade show" 
           *ngIf="showSuccessMessage" 
           role="alert">
        <i class="bi bi-check-circle"></i>
        {{ successMessage }}
        <button type="button" class="btn-close" (click)="showSuccessMessage = false"></button>
      </div>
    </div>
  `
})
export class DoctorDashboardComponent implements OnInit {
  doctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  doctorLoginName = '';
  doctorLoginDept = '';
  doctorAppointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  completedToday = 0;
  showSuccessMessage = false;
  successMessage = '';

  constructor(
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.doctorService.doctors$.subscribe(doctors => {
      this.doctors = doctors;
    });
    this.authService.currentDoctor$.subscribe(doc => {
      if (doc) {
        this.selectedDoctor = this.doctors.find(d => d.id === doc.id) || null;
        if (this.selectedDoctor) {
          this.loadDoctorAppointments();
          this.showSuccess(`Welcome, ${this.selectedDoctor.name}!`);
        }
      }
    });
  }

  loginDoctor(): void {
    if (!this.doctorLoginName || !this.doctorLoginDept) return;
    this.authService.loginDoctor(this.doctorLoginName, this.doctorLoginDept).subscribe({
      next: (profile) => {
        this.selectedDoctor = this.doctors.find(d => d.id === profile.id) || null;
        if (this.selectedDoctor) {
          this.loadDoctorAppointments();
          this.showSuccess(`Welcome, ${this.selectedDoctor.name}!`);
        }
      },
      error: () => {
        this.showSuccess('Login failed. Please check your name and department.');
      }
    });
  }

  logout(): void {
    this.selectedDoctor = null;
    this.doctorLoginName = '';
    this.doctorLoginDept = '';
    this.doctorAppointments = [];
    this.todayAppointments = [];
    this.completedToday = 0;
    this.authService.logoutDoctor();
  }

  loadDoctorAppointments(): void {
    if (!this.selectedDoctor) return;

    this.appointmentService.getAppointmentsByDoctor(this.selectedDoctor.id!).subscribe({
      next: (appointments) => {
        this.doctorAppointments = appointments;
        
        // Filter today's appointments
        const today = new Date().toDateString();
        this.todayAppointments = appointments.filter(a => 
          new Date(a.appointmentDate).toDateString() === today
        );
        
        // Count completed today
        this.completedToday = this.todayAppointments.filter(a => 
          a.status === 'completed'
        ).length;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  completeConsultation(appointmentId: number): void {
    this.appointmentService.completeAppointment(appointmentId).subscribe({
      next: () => {
        this.loadDoctorAppointments();
        this.showSuccess('Consultation marked as completed. Patient notification sent.');
      },
      error: (error) => {
        console.error('Error completing consultation:', error);
      }
    });
  }

  viewPatientDetails(appointment: Appointment): void {
    alert(`Patient Details:
Name: ${appointment.patientName}
Department: ${appointment.department}
Date: ${this.formatDate(appointment.appointmentDate)}
Time: ${appointment.appointmentTime}
Status: ${appointment.status}`);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
}