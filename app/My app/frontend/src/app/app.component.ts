import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="hospital-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="h3 mb-0">
              <i class="bi bi-hospital"></i>
              MediCare Hospital Management
            </h1>
            <p class="mb-0 opacity-75">Excellence in Healthcare Technology</p>
          </div>
          <div class="col-md-6 text-md-end">
            <nav class="d-flex gap-3 justify-content-md-end justify-content-start mt-2 mt-md-0">
              <a routerLink="/patients" routerLinkActive="text-warning" class="text-white text-decoration-none">
                <i class="bi bi-people"></i> Patients
              </a>
              <a routerLink="/doctors" routerLinkActive="text-warning" class="text-white text-decoration-none">
                <i class="bi bi-person-badge"></i> Doctors
              </a>
              <a routerLink="/appointments" routerLinkActive="text-warning" class="text-white text-decoration-none">
                <i class="bi bi-calendar-check"></i> Appointments
              </a>
              <a routerLink="/doctor-dashboard" routerLinkActive="text-warning" class="text-white text-decoration-none">
                <i class="bi bi-speedometer2"></i> Dashboard
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <div class="container-fluid py-4">
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'Hospital Management System';
}