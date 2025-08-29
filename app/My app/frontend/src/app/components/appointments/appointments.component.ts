import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService, Appointment } from '../../services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span><i class="bi bi-calendar-check"></i> All Appointments</span>
          <span class="badge bg-light text-dark">{{ appointments.length }} Total</span>
        </div>
        <div class="card-body">
          <div class="table-responsive" *ngIf="appointments.length > 0; else noAppointments">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let appointment of appointments">
                  <td>
                    <strong>{{ appointment.patientName }}</strong>
                  </td>
                  <td>{{ appointment.doctorName }}</td>
                  <td>
                    <span class="badge bg-primary">{{ appointment.department }}</span>
                  </td>
                  <td>{{ formatDate(appointment.appointmentDate) }}</td>
                  <td>
                    <span class="badge bg-info">{{ appointment.appointmentTime }}</span>
                  </td>
                  <td>
                    <span class="status-badge"
                          [ngClass]="{
                            'status-confirmed': appointment.status === 'confirmed',
                            'status-completed': appointment.status === 'completed'
                          }">
                      {{ appointment.status | titlecase }}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-success btn-sm"
                      *ngIf="appointment.status === 'confirmed'"
                      (click)="completeAppointment(appointment.id!)">
                      <i class="bi bi-check-circle"></i> Mark Complete
                    </button>
                    <span 
                      class="text-success"
                      *ngIf="appointment.status === 'completed'">
                      <i class="bi bi-check-circle"></i> Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <ng-template #noAppointments>
            <div class="text-center py-5">
              <i class="bi bi-calendar-x display-1 text-muted"></i>
              <h4 class="text-muted mt-3">No Appointments Found</h4>
              <p class="text-muted">Appointments will appear here once they are booked.</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.appointments$.subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  completeAppointment(appointmentId: number): void {
    this.appointmentService.completeAppointment(appointmentId).subscribe({
      next: () => {
        console.log('Appointment completed successfully');
      },
      error: (error) => {
        console.error('Error completing appointment:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}