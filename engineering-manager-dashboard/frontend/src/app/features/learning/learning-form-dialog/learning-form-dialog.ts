import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LearningService } from '../../../core/services/learning.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { LearningActivity } from '../../../core/models/learning.model';
import { Employee } from '../../../core/models/employee.model';
import { LearningCompletionStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-learning-form-dialog',
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
  templateUrl: './learning-form-dialog.html',
})
export class LearningFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<LearningFormDialog>);
  readonly data = inject<{ activity?: LearningActivity; employeeId?: string }>(MAT_DIALOG_DATA);
  private readonly learningService = inject(LearningService);
  private readonly employeesService = inject(EmployeesService);

  readonly LearningCompletionStatus = LearningCompletionStatus;
  readonly employees = signal<Employee[]>([]);
  readonly isSaving = signal(false);

  readonly statusOptions: LearningCompletionStatus[] = [
    LearningCompletionStatus.NOT_STARTED,
    LearningCompletionStatus.IN_PROGRESS,
    LearningCompletionStatus.COMPLETED,
  ];

  readonly isEditMode = !!this.data.activity;

  readonly form = this.fb.group({
    employeeId: [this.data.activity?.employeeId ?? this.data.employeeId ?? '', Validators.required],
    trainingName: [this.data.activity?.trainingName ?? '', Validators.required],
    certificationName: [this.data.activity?.certificationName ?? ''],
    skillArea: [this.data.activity?.skillArea ?? '', Validators.required],
    learningHours: [this.data.activity?.learningHours ?? 0, [Validators.required, Validators.min(0)]],
    completionStatus: [this.data.activity?.completionStatus ?? null as LearningCompletionStatus | null, Validators.required],
    completionDate: [this.data.activity?.completionDate ?? ''],
    expiryDate: [this.data.activity?.expiryDate ?? ''],
    notes: [''],
  });

  ngOnInit(): void {
    this.employeesService.findAll().subscribe((list) => this.employees.set(list));
    if (this.data.employeeId) {
      this.form.get('employeeId')!.disable();
    }
  }

  statusLabel(s: LearningCompletionStatus): string {
    switch (s) {
      case LearningCompletionStatus.NOT_STARTED: return 'Not Started';
      case LearningCompletionStatus.IN_PROGRESS: return 'In Progress';
      case LearningCompletionStatus.COMPLETED: return 'Completed';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const dto = {
      employeeId: raw.employeeId!,
      trainingName: raw.trainingName!,
      certificationName: raw.certificationName || null,
      skillArea: raw.skillArea!,
      learningHours: raw.learningHours!,
      completionStatus: raw.completionStatus!,
      completionDate: raw.completionDate || null,
      expiryDate: raw.expiryDate || null,
    };

    if (this.isEditMode && this.data.activity) {
      this.learningService.update(this.data.activity.id, dto).subscribe({
        next: (result) => {
          this.isSaving.set(false);
          this.dialogRef.close(result);
        },
        error: () => this.isSaving.set(false),
      });
    } else {
      this.learningService.create(dto).subscribe({
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
