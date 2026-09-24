import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeesService } from '../../../core/services/employees.service';
import { Employee } from '../../../core/models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss',
})
export class EmployeeList {
  private readonly employeesService = inject(EmployeesService);
  private readonly router = inject(Router);

  readonly columns = ['name', 'designation', 'department', 'gradeBand', 'project', 'experience', 'manager'];

  readonly isLoading = signal(true);
  readonly employees = signal<Employee[]>([]);
  readonly departments = signal<string[]>([]);

  readonly search = signal('');
  readonly department = signal('');

  readonly filteredEmployees = computed(() => {
    const search = this.search().toLowerCase().trim();
    const department = this.department();

    return this.employees().filter((employee) => {
      const matchesSearch =
        !search ||
        employee.fullName.toLowerCase().includes(search) ||
        employee.email.toLowerCase().includes(search) ||
        employee.employeeCode.toLowerCase().includes(search);
      const matchesDepartment = !department || employee.department === department;
      return matchesSearch && matchesDepartment;
    });
  });

  constructor() {
    this.employeesService.findAll().subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    this.employeesService.getDepartments().subscribe({
      next: (departments) => this.departments.set(departments),
      error: () => this.departments.set([]),
    });
  }

  openProfile(employee: Employee): void {
    void this.router.navigate(['/employees', employee.id]);
  }
}
