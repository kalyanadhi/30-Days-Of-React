import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EvaluationsService } from '../../../core/services/evaluations.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { PerformanceEvaluation } from '../../../core/models/evaluation.model';
import { Employee } from '../../../core/models/employee.model';
import { EvaluationStatus, Quarter } from '../../../core/models/enums';

@Component({
  selector: 'app-evaluation-form-dialog',
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
  templateUrl: './evaluation-form-dialog.html',
})
export class EvaluationFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EvaluationFormDialog>);
  readonly data = inject<{ evaluation?: PerformanceEvaluation }>(MAT_DIALOG_DATA);
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly employeesService = inject(EmployeesService);

  readonly quarters = Object.values(Quarter);
  readonly statuses = Object.values(EvaluationStatus);
  readonly employees = signal<Employee[]>([]);
  readonly isSaving = signal(false);
  readonly isEditMode = !!this.data?.evaluation;

  readonly form = this.fb.group({
    employeeId: [this.data?.evaluation?.employeeId ?? '', Validators.required],
    quarter: [this.data?.evaluation?.quarter ?? null as Quarter | null, Validators.required],
    year: [this.data?.evaluation?.year ?? new Date().getFullYear(), Validators.required],
    deliveryScore: [this.data?.evaluation?.deliveryScore ?? null as number | null, [Validators.min(1), Validators.max(5)]],
    technicalScore: [this.data?.evaluation?.technicalScore ?? null as number | null, [Validators.min(1), Validators.max(5)]],
    qualityScore: [this.data?.evaluation?.qualityScore ?? null as number | null, [Validators.min(1), Validators.max(5)]],
    collaborationScore: [this.data?.evaluation?.collaborationScore ?? null as number | null, [Validators.min(1), Validators.max(5)]],
    learningScore: [this.data?.evaluation?.learningScore ?? null as number | null, [Validators.min(1), Validators.max(5)]],
    managerFeedback: [this.data?.evaluation?.managerFeedback ?? ''],
    status: [this.data?.evaluation?.status ?? EvaluationStatus.DRAFT, Validators.required],
  });

  ngOnInit(): void {
    this.employeesService.findAll().subscribe((list) => this.employees.set(list));
    if (this.isEditMode) {
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
      this.evaluationsService
        .update(this.data!.evaluation!.id, {
          quarter: raw.quarter!,
          year: +(raw.year ?? new Date().getFullYear()),
          deliveryScore: +(raw.deliveryScore ?? 0),
          technicalScore: +(raw.technicalScore ?? 0),
          qualityScore: +(raw.qualityScore ?? 0),
          collaborationScore: +(raw.collaborationScore ?? 0),
          learningScore: +(raw.learningScore ?? 0),
          managerFeedback: raw.managerFeedback || null,
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
      this.evaluationsService
        .create({
          employeeId: raw.employeeId!,
          quarter: raw.quarter!,
          year: +(raw.year ?? new Date().getFullYear()),
          deliveryScore: +(raw.deliveryScore ?? 0),
          technicalScore: +(raw.technicalScore ?? 0),
          qualityScore: +(raw.qualityScore ?? 0),
          collaborationScore: +(raw.collaborationScore ?? 0),
          learningScore: +(raw.learningScore ?? 0),
          managerFeedback: raw.managerFeedback || null,
          employeeComments: null,
          calibrationNotes: null,
          finalRating: null,
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
