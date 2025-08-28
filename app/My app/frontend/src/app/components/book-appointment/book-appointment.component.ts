import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService, Patient } from '../../services/patient.service';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { AppointmentService, Appointment } from '../../services/appointment.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Patient Login Gate -->
      <div class="row" *ngIf="!loggedInPatient">
        <div class="col-12">
          <div class="alert alert-info d-flex justify-content-between align-items-center">
            <div>
              <i class="bi bi-box-arrow-in-right"></i>
              Please login to book an appointment.
            </div>
            <form class="d-flex gap-2" (ngSubmit)="loginPatient()" #patientLoginForm="ngForm">
              <input class="form-control" placeholder="Name" [(ngModel)]="patientLoginName" name="patientLoginName" required>
              <input class="form-control" placeholder="Mobile" [(ngModel)]="patientLoginMobile" name="patientLoginMobile" required pattern="[0-9]{10}">
              <button class="btn btn-primary" [disabled]="!patientLoginName || !patientLoginMobile">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <a routerLink="/patients" class="text-decoration-none">Patients</a>
              </li>
              <li class="breadcrumb-item active">Book Appointment</li>
            </ol>
          </nav>
        </div>
      </div>

      <div class="row" *ngIf="patient">
        <!-- Patient Information -->
        <div class="col-lg-4 mb-4">
          <div class="card patient-card">
            <div class="card-header">
              <i class="bi bi-person"></i> Patient Information
            </div>
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                     style="width: 60px; height: 60px;">
                  <i class="bi bi-person fs-3"></i>
                </div>
                <div>
                  <h5 class="mb-1">{{ patient.name }}</h5>
                  <p class="mb-0 text-muted">Patient ID: {{ patient.id }}</p>
                </div>
              </div>
              
              <div class="row">
                <div class="col-6">
                  <small class="text-muted">Age:</small><br>
                  <strong>{{ patient.age }} years</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted">Gender:</small><br>
                  <strong>{{ patient.gender }}</strong>
                </div>
              </div>
              
              <hr>
              
              <div>
                <small class="text-muted">Contact:</small><br>
                <strong>{{ patient.mobile }}</strong>
              </div>
            </div>
          </div>

          <!-- Appointment Form -->
          <div class="card mt-4" *ngIf="selectedDoctor">
            <div class="card-header">
              <i class="bi bi-calendar-plus"></i> Appointment Details
            </div>
            <div class="card-body">
              <form (ngSubmit)="bookAppointment()" #appointmentForm="ngForm">
                <div class="mb-3">
                  <label class="form-label">Selected Doctor</label>
                  <div class="p-3 bg-light rounded">
                    <strong>{{ selectedDoctor.name }}</strong><br>
                    <small class="text-muted">{{ selectedDoctor.department }}</small>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="appointmentDate" class="form-label">Appointment Date</label>
                  <input 
                    type="date" 
                    class="form-control" 
                    id="appointmentDate"
                    [(ngModel)]="appointmentDate" 
                    name="appointmentDate"
                    [min]="minDate"
                    required>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Available Time Slots</label>
                  <div class="d-flex flex-wrap gap-2">
                    <div 
                      *ngFor="let slot of selectedDoctor.availableSlots"
                      class="time-slot"
                      [class.selected]="selectedTimeSlot === slot"
                      [class.unavailable]="!isSlotAvailable(slot)"
                      (click)="selectTimeSlot(slot)">
                      {{ slot }}
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-success w-100"
                  [disabled]="!selectedTimeSlot || !appointmentDate || isLoading || !loggedInPatient">
                  <i class="bi bi-calendar-check"></i>
                  {{ isLoading ? 'Booking...' : 'Confirm Appointment' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Available Doctors -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-person-badge"></i> Select a Doctor</span>
              <span class="badge bg-light text-dark">{{ doctors.length }} Available</span>
            </div>
            <div class="card-body">
              <div class="row" *ngIf="doctors.length > 0; else noDoctors">
                <div class="col-md-6 mb-4" *ngFor="let doctor of doctors">
                  <div class="card h-100 shadow-sm doctor-card"
                       [class.border-0]="selectedDoctor?.id !== doctor.id"
                       [class.border]="selectedDoctor?.id === doctor.id"
                       [class.border-success]="selectedDoctor?.id === doctor.id"
                       style="cursor: pointer;"
                       (click)="selectDoctor(doctor)">
                    <div class="card-body">
                      <div class="d-flex align-items-start mb-3">
                        <div class="rounded-circle d-flex align-items-center justify-content-center me-3"
                             [class.bg-success]="selectedDoctor?.id === doctor.id"
                             [class.bg-primary]="selectedDoctor?.id !== doctor.id"
                             [class.text-white]="true"
                             style="width: 50px; height: 50px; min-width: 50px;">
                          <i class="bi bi-person-badge fs-4"></i>
                        </div>
                        <div class="flex-grow-1">
                          <h5 class="card-title mb-1">{{ doctor.name }}</h5>
                          <p class="card-text text-muted mb-2">{{ doctor.department }}</p>
                          <div class="mb-2">
                            <small class="text-muted">Specialization:</small><br>
                            <strong class="text-primary">{{ doctor.specialization || 'General Practice' }}</strong>
                          </div>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                          <small class="text-muted">Experience:</small>
                          <span class="badge bg-info">{{ doctor.experience }} years</span>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <small class="text-muted">Available Today:</small><br>
                        <div class="d-flex flex-wrap gap-1">
                          <small 
                            class="badge bg-outline-success border border-success text-success" 
                            *ngFor="let slot of doctor.availableSlots.slice(0, 3)">
                            {{ slot }}
                          </small>
                          <small 
                            class="badge bg-light text-muted"
                            *ngIf="doctor.availableSlots.length > 3">
                            +{{ doctor.availableSlots.length - 3 }} more
                          </small>
                        </div>
                      </div>
                      
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-success">
                          <i class="bi bi-check-circle"></i> Available
                        </small>
                        <button 
                          class="btn btn-sm"
                          [class.btn-success]="selectedDoctor?.id === doctor.id"
                          [class.btn-outline-primary]="selectedDoctor?.id !== doctor.id">
                          {{ selectedDoctor?.id === doctor.id ? 'Selected' : 'Select' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <ng-template #noDoctors>
                <div class="text-center py-5">
                  <i class="bi bi-person-badge-fill display-1 text-muted"></i>
                  <h4 class="text-muted mt-3">No Doctors Available</h4>
                  <p class="text-muted">Please register doctors first to enable appointment booking.</p>
                  <a routerLink="/doctors" class="btn btn-primary">
                    <i class="bi bi-person-plus"></i> Register Doctors
                  </a>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div class="modal fade" id="successModal" tabindex="-1" *ngIf="showSuccessModal">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title">
                <i class="bi bi-check-circle"></i> Appointment Confirmed!
              </h5>
            </div>
            <div class="modal-body text-center">
              <div class="mb-4">
                <i class="bi bi-calendar-check display-1 text-success"></i>
              </div>
              <h4>Appointment Booked Successfully!</h4>
              <div class="card bg-light mt-4">
                <div class="card-body">
                  <h6 class="card-title">Appointment Details</h6>
                  <p class="mb-1"><strong>Patient:</strong> {{ patient?.name }}</p>
                  <p class="mb-1"><strong>Doctor:</strong> {{ selectedDoctor?.name }}</p>
                  <p class="mb-1"><strong>Department:</strong> {{ selectedDoctor?.department }}</p>
                  <p class="mb-1"><strong>Date:</strong> {{ formatDate(appointmentDate) }}</p>
                  <p class="mb-0"><strong>Time:</strong> {{ selectedTimeSlot }}</p>
                </div>
              </div>
              <div class="alert alert-info mt-3">
                <i class="bi bi-phone"></i>
                SMS confirmation sent to {{ patient?.mobile }}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" (click)="closeSuccessModal()">
                <i class="bi bi-arrow-left"></i> Back to Patients
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Alert -->
      <div class="alert alert-danger alert-dismissible fade show" 
           *ngIf="errorMessage" 
           role="alert">
        <i class="bi bi-exclamation-triangle"></i>
        {{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>
    </div>
  `
})
export class BookAppointmentComponent implements OnInit {
  patient: Patient | null = null;
  doctors: Doctor[] = [];
  selectedDoctor: Doctor | null = null;
  appointmentDate: string = '';
  selectedTimeSlot: string = '';
  isLoading = false;
  showSuccessModal = false;
  errorMessage = '';
  minDate = '';
  loggedInPatient: { id: number; name: string; mobile: string } | null = null;
  patientLoginName = '';
  patientLoginMobile = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const patientId = Number(this.route.snapshot.paramMap.get('patientId'));
    
    // Load patient data
    const patients = this.patientService.getCurrentPatients();
    this.patient = patients.find(p => p.id === patientId) || null;
    
    if (!this.patient) {
      this.errorMessage = 'Patient not found. Please go back and try again.';
      return;
    }

    // Subscribe to auth state
    this.authService.currentPatient$.subscribe(p => {
      this.loggedInPatient = p;
      if (p && this.patient && p.id !== this.patient.id) {
        // Redirect to the logged in patient's booking page
        this.router.navigate(['/book-appointment', p.id]);
      }
    });

    // Load doctors
    this.doctorService.doctors$.subscribe(doctors => {
      this.doctors = doctors;
    });
  }

  selectDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.selectedTimeSlot = ''; // Reset time slot when doctor changes
  }

  selectTimeSlot(slot: string): void {
    if (this.isSlotAvailable(slot)) {
      this.selectedTimeSlot = slot;
    }
  }

  isSlotAvailable(slot: string): boolean {
    if (!this.selectedDoctor || !this.appointmentDate) {
      return true; // Show as available if no date selected yet
    }
    
    return this.appointmentService.isTimeSlotAvailable(
      this.selectedDoctor.id!,
      this.appointmentDate,
      slot
    );
  }

  bookAppointment(): void {
    if (!this.loggedInPatient) {
      this.errorMessage = 'Please login before booking.';
      return;
    }
    if (!this.patient || !this.selectedDoctor || !this.appointmentDate || !this.selectedTimeSlot) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    if (!this.isSlotAvailable(this.selectedTimeSlot)) {
      this.errorMessage = 'Selected time slot is no longer available. Please choose another slot.';
      return;
    }

    this.isLoading = true;

    const appointment: Appointment = {
      patientId: this.loggedInPatient.id,
      patientName: this.loggedInPatient.name,
      doctorId: this.selectedDoctor.id!,
      doctorName: this.selectedDoctor.name,
      department: this.selectedDoctor.department,
      appointmentDate: this.appointmentDate,
      appointmentTime: this.selectedTimeSlot,
      status: 'confirmed'
    };

    this.appointmentService.createAppointment(appointment).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.showSuccessModal = true;
        
        // Simulate SMS notification
        console.log(`SMS sent to ${this.patient?.mobile}: 
Appointment confirmed with ${this.selectedDoctor?.name} 
Date: ${this.formatDate(this.appointmentDate)} 
Time: ${this.selectedTimeSlot}
Department: ${this.selectedDoctor?.department}`);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to book appointment. Please try again.';
        console.error('Error booking appointment:', error);
      }
    });
  }

  loginPatient(): void {
    if (!this.patientLoginName || !this.patientLoginMobile) return;
    this.authService.loginPatient(this.patientLoginName, this.patientLoginMobile).subscribe({
      next: (profile) => {
        if (this.patient && profile.id !== this.patient.id) {
          // Navigate to the correct patient's booking page
          this.router.navigate(['/book-appointment', profile.id]);
        }
      },
      error: () => {
        this.errorMessage = 'Login failed. Please check your name and mobile number.';
      }
    });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/patients']);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}