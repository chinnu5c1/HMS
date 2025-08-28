import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor } from '../../services/doctor.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="row">
        <!-- Doctor Registration Form -->
        <div class="col-lg-4 mb-4">
          <div class="card doctor-card">
            <div class="card-header">
              <i class="bi bi-person-badge"></i> Doctor Registration
            </div>
            <div class="card-body">
              <form (ngSubmit)="saveDoctor()" #doctorForm="ngForm">
                <div class="mb-3">
                  <label for="name" class="form-label">Doctor Name</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="name" 
                    [(ngModel)]="newDoctor.name" 
                    name="name"
                    required
                    placeholder="Dr. Full Name">
                </div>
                
                <div class="mb-3">
                  <label for="department" class="form-label">Department</label>
                  <select 
                    class="form-control" 
                    id="department" 
                    [(ngModel)]="newDoctor.department" 
                    name="department"
                    required>
                    <option value="">Select Department</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label for="specialization" class="form-label">Specialization</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="specialization" 
                    [(ngModel)]="newDoctor.specialization" 
                    name="specialization"
                    placeholder="Area of expertise">
                </div>
                
                <div class="mb-3">
                  <label for="experience" class="form-label">Years of Experience</label>
                  <input 
                    type="number" 
                    class="form-control" 
                    id="experience" 
                    [(ngModel)]="newDoctor.experience" 
                    name="experience"
                    min="1" 
                    max="50"
                    required
                    placeholder="Years">
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Available Time Slots</label>
                  <div class="row">
                    <div class="col-6 col-md-4 mb-2" *ngFor="let slot of availableTimeSlots">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          [id]="'slot-' + slot"
                          [checked]="newDoctor.availableSlots.includes(slot)"
                          (change)="toggleTimeSlot(slot)">
                        <label class="form-check-label" [for]="'slot-' + slot">
                          {{ slot }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  class="btn btn-success w-100"
                  [disabled]="!doctorForm.form.valid || newDoctor.availableSlots.length === 0 || isLoading">
                  <i class="bi bi-person-plus"></i>
                  {{ isLoading ? 'Saving...' : 'Register Doctor' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Doctors List -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <span><i class="bi bi-people"></i> Medical Staff</span>
              <span class="badge bg-light text-dark">{{ doctors.length }} Doctors</span>
            </div>
            <div class="card-body">
              <div class="row" *ngIf="doctors.length > 0; else noDoctors">
                <div class="col-md-6 col-xl-4 mb-4" *ngFor="let doctor of doctors">
                  <div class="card doctor-card h-100 border-0 shadow-sm">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-3">
                        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" 
                             style="width: 50px; height: 50px;">
                          <i class="bi bi-person-badge fs-4"></i>
                        </div>
                        <div>
                          <h5 class="card-title mb-1">{{ doctor.name }}</h5>
                          <p class="card-text text-muted mb-0">{{ doctor.department }}</p>
                        </div>
                      </div>
                      
                      <div class="mb-3">
                        <small class="text-muted">Specialization:</small><br>
                        <strong>{{ doctor.specialization || 'General Practice' }}</strong>
                      </div>
                      
                      <div class="mb-3">
                        <small class="text-muted">Experience:</small><br>
                        <span class="badge bg-info">{{ doctor.experience }} years</span>
                      </div>
                      
                      <div class="mb-3">
                        <small class="text-muted">Available Slots:</small><br>
                        <div class="d-flex flex-wrap gap-1">
                          <span 
                            class="badge bg-success" 
                            *ngFor="let slot of doctor.availableSlots">
                            {{ slot }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                          <i class="bi bi-calendar-check"></i>
                          Available Today
                        </small>
                        <div class="dropdown">
                          <button 
                            class="btn btn-outline-primary btn-sm dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown">
                            Actions
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <a class="dropdown-item" href="#" (click)="viewDoctorSchedule(doctor)">
                                <i class="bi bi-calendar"></i> View Schedule
                              </a>
                            </li>
                            <li>
                              <a class="dropdown-item" href="#" (click)="editDoctor(doctor)">
                                <i class="bi bi-pencil"></i> Edit Profile
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <ng-template #noDoctors>
                <div class="text-center py-5">
                  <i class="bi bi-person-badge-fill display-1 text-muted"></i>
                  <h4 class="text-muted mt-3">No Doctors Registered</h4>
                  <p class="text-muted">Register medical staff to start managing appointments.</p>
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
export class DoctorsComponent implements OnInit {
  doctors: Doctor[] = [];
  newDoctor: Doctor = {
    name: '',
    department: '',
    experience: 0,
    availableSlots: [],
    specialization: ''
  };
  isLoading = false;
  showSuccessMessage = false;
  successMessage = '';

  availableTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.doctorService.doctors$.subscribe(doctors => {
      this.doctors = doctors;
    });
  }

  saveDoctor(): void {
    if (!this.newDoctor.name || !this.newDoctor.department || !this.newDoctor.experience || this.newDoctor.availableSlots.length === 0) {
      return;
    }

    this.isLoading = true;
    this.doctorService.createDoctor(this.newDoctor).subscribe({
      next: (doctor) => {
        this.showSuccess(`Dr. ${doctor.name} registered successfully!`);
        this.resetForm();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating doctor:', error);
        this.isLoading = false;
      }
    });
  }

  toggleTimeSlot(slot: string): void {
    const index = this.newDoctor.availableSlots.indexOf(slot);
    if (index > -1) {
      this.newDoctor.availableSlots.splice(index, 1);
    } else {
      this.newDoctor.availableSlots.push(slot);
    }
    this.newDoctor.availableSlots.sort();
  }

  viewDoctorSchedule(doctor: Doctor): void {
    // This would typically show a detailed schedule modal
    alert(`Viewing schedule for ${doctor.name}\nAvailable slots: ${doctor.availableSlots.join(', ')}`);
  }

  editDoctor(doctor: Doctor): void {
    // This would typically open an edit modal
    alert(`Edit functionality for ${doctor.name} would be implemented here.`);
  }

  private resetForm(): void {
    this.newDoctor = {
      name: '',
      department: '',
      experience: 0,
      availableSlots: [],
      specialization: ''
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