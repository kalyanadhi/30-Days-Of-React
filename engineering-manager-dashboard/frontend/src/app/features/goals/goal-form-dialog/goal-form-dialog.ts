import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoalsService } from '../../../core/services/goals.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { Goal } from '../../../core/models/goal.model';
import { Employee } from '../../../core/models/employee.model';
import { GoalPriority, GoalStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-goal-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './goal-form-dialog.html',
})
export class GoalFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<GoalFormDialog>);
  readonly data = inject<{ goal?: Goal; employeeId?: string }>(MAT_DIALOG_DATA);
  private readonly goalsService = inject(GoalsService);
  private readonly employeesService = inject(EmployeesService);

  readonly priorities = Object.values(GoalPriority);
  readonly statuses = Object.values(GoalStatus);
  readonly employees = signal<Employee[]>([]);
  readonly isSaving = signal(false);
  readonly isEditMode = !!this.data?.goal;

  private readonly prefillEmployeeId =
    this.data?.goal?.employeeId ?? this.data?.employeeId ?? '';

  readonly form = this.fb.group({
    employeeId: [this.prefillEmployeeId, Validators.required],
    title: [this.data?.goal?.title ?? '', Validators.required],
    description: [this.data?.goal?.description ?? ''],
    dueDate: [this.data?.goal?.dueDate ?? '', Validators.required],
    priority: [this.data?.goal?.priority ?? null as GoalPriority | null, Validators.required],
    progressPercentage: [
      this.data?.goal?.progressPercentage ?? 0,
      [Validators.min(0), Validators.max(100)],
    ],
    status: [this.data?.goal?.status ?? GoalStatus.NOT_STARTED, Validators.required],
  });

  ngOnInit(): void {
    this.employeesService.findAll().subscribe((list) => this.employees.set(list));
    if (this.prefillEmployeeId) {
      this.form.get('employeeId')!.disable();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    if (this.isEditMode) {
      this.goalsService
        .update(this.data!.goal!.id, {
          title: raw.title!,
          description: raw.description || null,
          dueDate: raw.dueDate!,
          priority: raw.priority!,
          progressPercentage: +(raw.progressPercentage ?? 0),
          status: raw.status!,
        })
        .subscribe({
          next: (result) => {
            this.isSaving.set(false);
            this.dialogRef.close(result);
          },
          error: () => this.isSaving.set(false),
        });
    } else {
      this.goalsService
        .create({
          employeeId: raw.employeeId!,
          title: raw.title!,
          description: raw.description || null,
          dueDate: raw.dueDate!,
          priority: raw.priority!,
          weight: 1,
          progressPercentage: +(raw.progressPercentage ?? 0),
          status: raw.status!,
        })
        .subscribe({
          next: (result) => {
            this.isSaving.set(false);
            this.dialogRef.close(result);
          },
          error: () => this.isSaving.set(false),
        });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
