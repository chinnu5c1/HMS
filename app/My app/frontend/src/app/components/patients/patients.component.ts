import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PatientService, Patient } from '../../services/patient.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="row">
        <!-- Patient Registration Form -->
        <div class="col-lg-4 mb-4">
          <div class="card patient-card">
            <div class="card-header">
              <i class="bi bi-person-plus"></i> Patient Registration
            </div>
            <div class="card-body">
              <form (ngSubmit)="savePatient()" #patientForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Full Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    [(ngModel)]="newPatient.name" 
                    name="name"
                    required
                    placeholder="Enter patient's full name">
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="age" class="form-label">Age</label>
                    <input 
                      type="number" 
                      class="form-control" 
                      id="age" 
                      [(ngModel)]="newPatient.age" 
                      name="age"
                      min="1" 
                      max="120"
                      required
                      placeholder="Age">
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="gender" class="form-label">Gender</label>
                    <select 
                      class="form-control" 
                      id="gender" 
                      [(ngModel)]="newPatient.gender" 
                      name="gender"
                      required>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="mobile" class="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="mobile" 
                    [(ngModel)]="newPatient.mobile" 
                    name="mobile"
                    pattern="[0-9]{10}"
                    required
                    placeholder="10-digit mobile number">
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-primary w-100"
                  [disabled]="!patientForm.form.valid || isLoading">
                  <i class="bi bi-person-plus"></i>
                  {{ isLoading ? 'Saving...' : 'Save Patient' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Patients List -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-people"></i> Registered Patients</span>
              <span class="badge bg-light text-dark">{{ patients.length }} Total</span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" *ngIf="patients.length > 0; else noPatients">
                <table class="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Mobile</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let patient of patients">
                      <td>
                        <strong>{{ patient.name }}</strong>
                      </td>
                      <td>{{ patient.age }}</td>
                      <td>
                        <span class="badge" 
                              [ngClass]="{
                                'bg-primary': patient.gender === 'Male',
                                'bg-danger': patient.gender === 'Female',
                                'bg-secondary': patient.gender === 'Other'
                              }">
                          {{ patient.gender }}
                        </span>
                      </td>
                      <td>{{ patient.mobile }}</td>
                      <td>{{ formatDate(patient.registrationDate) }}</td>
                      <td>
                        <div class="btn-group" role="group">
                          <button 
                            class="btn btn-success btn-sm"
                            [routerLink]="['/book-appointment', patient.id]">
                            <i class="bi bi-calendar-plus"></i> Book Appointment
                          </button>
                          <button 
                            class="btn btn-info btn-sm"
                            (click)="viewAppointments(patient)">
                            <i class="bi bi-calendar-check"></i> View History
                          </button>
                          <button 
                            class="btn btn-outline-danger btn-sm"
                            (click)="deletePatient(patient.id!)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <ng-template #noPatients>
                <div class="text-center py-5">
                  <i class="bi bi-person-x display-1 text-muted"></i>
                  <h4 class="text-muted mt-3">No Patients Registered</h4>
                  <p class="text-muted">Start by registering a new patient using the form on the left.</p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- Patient Appointments Modal -->
      <div class="modal fade" id="appointmentsModal" tabindex="-1" *ngIf="selectedPatient">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-calendar-check"></i>
                Appointments for {{ selectedPatient.name }}
              </h5>
              <button type="button" class="btn-close" aria-label="Close" (click)="closeAppointmentsModal()"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="patientAppointments.length > 0; else noAppointments">
                <div class="row">
                  <div class="col-md-6 mb-3" *ngFor="let appointment of patientAppointments">
                    <div class="card appointment-card h-100">
                      <div class="card-body">
                        <h6 class="card-title">{{ appointment.doctorName }}</h6>
                        <p class="card-text">
                          <small class="text-muted">{{ appointment.department }}</small><br>
                          <strong>Date:</strong> {{ formatDate(appointment.appointmentDate) }}<br>
                          <strong>Time:</strong> {{ appointment.appointmentTime }}
                        </p>
                        <span class="status-badge"
                              [ngClass]="{
                                'status-confirmed': appointment.status === 'confirmed',
                                'status-completed': appointment.status === 'completed'
                              }">
                          {{ appointment.status | titlecase }}
                        </span>
                        <div *ngIf="appointment.notes" class="mt-2">
                          <small class="text-success">
                            <i class="bi bi-check-circle"></i> {{ appointment.notes }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <ng-template #noAppointments>
                <div class="text-center py-4">
                  <i class="bi bi-calendar-x display-4 text-muted"></i>
                  <h5 class="text-muted mt-3">No Appointments Found</h5>
                  <p class="text-muted">This patient has no appointment history.</p>
                  <button 
                    class="btn btn-primary"
                    [routerLink]="['/book-appointment', selectedPatient.id]"
                    (click)="closeAppointmentsModal()">
                    <i class="bi bi-calendar-plus"></i> Book First Appointment
                  </button>
                </div>
              </ng-template>
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
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  newPatient: Patient = {
    name: '',
    age: 0,
    gender: '',
    mobile: ''
  };
  selectedPatient: Patient | null = null;
  patientAppointments: any[] = [];
  isLoading = false;
  showSuccessMessage = false;
  successMessage = '';

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.patientService.patients$.subscribe(patients => {
      this.patients = patients;
    });
  }

  savePatient(): void {
    if (!this.newPatient.name || !this.newPatient.age || !this.newPatient.gender || !this.newPatient.mobile) {
      return;
    }

    this.isLoading = true;
    this.patientService.createPatient(this.newPatient).subscribe({
      next: (patient) => {
        this.showSuccess(`Patient ${patient.name} registered successfully!`);
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating patient:', error);
        this.isLoading = false;
      }
    });
  }

  deletePatient(id: number): void {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.showSuccess('Patient deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
        }
      });
    }
  }

  viewAppointments(patient: Patient): void {
    this.selectedPatient = patient;
    this.appointmentService.getAppointmentsByPatient(patient.id!).subscribe({
      next: (appointments) => {
        this.patientAppointments = appointments;
        // Manually trigger modal (in real app, you'd use Bootstrap JS)
        const modal = document.getElementById('appointmentsModal');
        if (modal) {
          modal.style.display = 'block';
          modal.classList.add('show');
        }
      }
    });
  }

  closeAppointmentsModal(): void {
    const modal = document.getElementById('appointmentsModal');
    if (modal) {
      modal.classList.remove('show');
      (modal as HTMLElement).style.display = 'none';
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  private resetForm(): void {
    this.newPatient = {
      name: '',
      age: 0,
      gender: '',
      mobile: ''
    };
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
}