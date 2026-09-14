import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AchievementsService } from '../../../core/services/achievements.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { Achievement } from '../../../core/models/achievement.model';
import { Employee } from '../../../core/models/employee.model';
import { AchievementCategory } from '../../../core/models/enums';

@Component({
  selector: 'app-achievement-form-dialog',
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
  templateUrl: './achievement-form-dialog.html',
})
export class AchievementFormDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AchievementFormDialog>);
  readonly data = inject<{ achievement?: Achievement; employeeId?: string }>(MAT_DIALOG_DATA);
  private readonly achievementsService = inject(AchievementsService);
  private readonly employeesService = inject(EmployeesService);

  readonly AchievementCategory = AchievementCategory;
  readonly employees = signal<Employee[]>([]);
  readonly isSaving = signal(false);

  readonly categoryOptions: AchievementCategory[] = [
    AchievementCategory.DELIVERY,
    AchievementCategory.TECHNICAL,
    AchievementCategory.LEADERSHIP,
    AchievementCategory.CUSTOMER_APPRECIATION,
    AchievementCategory.INNOVATION,
    AchievementCategory.PROCESS_IMPROVEMENT,
  ];

  readonly form = this.fb.group({
    employeeId: [this.data.achievement?.employeeId ?? this.data.employeeId ?? '', Validators.required],
    title: [this.data.achievement?.title ?? '', Validators.required],
    description: [this.data.achievement?.description ?? ''],
    category: [this.data.achievement?.category ?? null as AchievementCategory | null, Validators.required],
    date: [this.data.achievement?.date ?? new Date().toISOString().slice(0, 10), Validators.required],
    impactDescription: [this.data.achievement?.impact ?? ''],
  });

  ngOnInit(): void {
    this.employeesService.findAll().subscribe((list) => this.employees.set(list));
    if (this.data.employeeId) {
      this.form.get('employeeId')!.disable();
    }
  }

  categoryLabel(c: AchievementCategory): string {
    switch (c) {
      case AchievementCategory.DELIVERY: return 'Delivery';
      case AchievementCategory.TECHNICAL: return 'Technical';
      case AchievementCategory.LEADERSHIP: return 'Leadership';
      case AchievementCategory.CUSTOMER_APPRECIATION: return 'Customer Appreciation';
      case AchievementCategory.INNOVATION: return 'Innovation';
      case AchievementCategory.PROCESS_IMPROVEMENT: return 'Process Improvement';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    this.achievementsService.create({
      employeeId: raw.employeeId!,
      title: raw.title!,
      description: raw.description || null,
      category: raw.category!,
      date: raw.date!,
      impact: raw.impactDescription || null,
      evidenceUrl: null,
    }).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        this.dialogRef.close(result);
      },
      error: () => this.isSaving.set(false),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
