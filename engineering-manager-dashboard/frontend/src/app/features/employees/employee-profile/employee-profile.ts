import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeesService } from '../../../core/services/employees.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { Employee } from '../../../core/models/employee.model';
import { Role } from '../../../core/models/enums';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.scss',
})
export class EmployeeProfile implements OnInit {
  private readonly employeesService = inject(EmployeesService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  readonly isLoading = signal(true);
  readonly employee = signal<Employee | null>(null);
  readonly error = signal<string | null>(null);

  readonly isManager = computed(() => {
    const role = this.authStore.role();
    return role === Role.ENGINEERING_MANAGER || role === Role.DIRECTOR;
  });

  readonly initials = computed(() => {
    const name = this.employee()?.fullName ?? '';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.employeesService.findOne(this.id()).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Unable to load this employee profile.');
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    void this.router.navigate(['/employees']);
  }
}
