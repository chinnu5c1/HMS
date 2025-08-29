import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/patients', pathMatch: 'full' },
  { 
    path: 'patients', 
    loadComponent: () => import('./components/patients/patients.component').then(m => m.PatientsComponent)
  },
  { 
    path: 'doctors', 
    loadComponent: () => import('./components/doctors/doctors.component').then(m => m.DoctorsComponent)
  },
  { 
    path: 'appointments', 
    loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent)
  },
  { 
    path: 'book-appointment/:patientId', 
    loadComponent: () => import('./components/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
  },
  { 
    path: 'doctor-dashboard', 
    loadComponent: () => import('./components/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent)
  }
];