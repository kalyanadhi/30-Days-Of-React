import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DevelopmentPlansService } from '../../../core/services/development-plans.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { DevelopmentPlan, CreateDevelopmentPlanRequest } from '../../../core/models/development-plan.model';
import { Employee } from '../../../core/models/employee.model';
import { GoalStatus } from '../../../core/models/enums';

export interface DevelopmentPlanFormDialogData {
  plan?: DevelopmentPlan;
  employeeId?: string;
}

@Component({
  selector: 'app-development-plan-form-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './development-plan-form-dialog.html',
})
export class DevelopmentPlanFormDialog {
  private readonly dialogRef = inject(MatDialogRef<DevelopmentPlanFormDialog>);
  readonly data = inject<DevelopmentPlanFormDialogData>(MAT_DIALOG_DATA);
  private readonly developmentPlansService = inject(DevelopmentPlansService);
  private readonly employeesService = inject(EmployeesService);

  readonly GoalStatus = GoalStatus;
  readonly statusOptions: GoalStatus[] = [
    GoalStatus.NOT_STARTED,
    GoalStatus.IN_PROGRESS,
    GoalStatus.AT_RISK,
    GoalStatus.COMPLETED,
  ];

  readonly employees = signal<Employee[]>([]);
  readonly isLoadingEmployees = signal(true);
  readonly isSaving = signal(false);

  readonly targetSkillsArray = signal<string[]>(
    this.data.plan?.targetSkills
      ? this.data.plan.targetSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  );

  readonly isEdit = !!this.data.plan;
  readonly employeeIdDisabled = !!this.data.employeeId;

  private readonly todayStr = new Date().toISOString().substring(0, 10);

  employeeId = this.data.employeeId ?? this.data.plan?.employeeId ?? '';
  title = this.data.plan?.title ?? '';
  description = this.data.plan?.description ?? '';
  targetDate = this.data.plan?.targetDate ?? '';
  startDate = this.data.plan?.startDate ?? this.todayStr;
  status: GoalStatus = this.data.plan?.status ?? GoalStatus.NOT_STARTED;
  milestones = this.data.plan?.notes ?? '';
  newSkill = '';

  constructor() {
    this.employeesService.findAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.isLoadingEmployees.set(false);
      },
      error: () => this.isLoadingEmployees.set(false),
    });
  }

  addSkill(): void {
    const val = this.newSkill.trim();
    if (!val) return;
    this.targetSkillsArray.update((skills) => [...skills, val]);
    this.newSkill = '';
  }

  removeSkill(index: number): void {
    this.targetSkillsArray.update((skills) => skills.filter((_, i) => i !== index));
  }

  statusLabel(s: GoalStatus): string {
    switch (s) {
      case GoalStatus.NOT_STARTED: return 'Not Started';
      case GoalStatus.IN_PROGRESS: return 'In Progress';
      case GoalStatus.AT_RISK: return 'At Risk';
      case GoalStatus.COMPLETED: return 'Completed';
    }
  }

  isFormValid(): boolean {
    return !!this.employeeId && !!this.title.trim() && !!this.targetDate && !!this.startDate && !!this.status;
  }

  submit(): void {
    if (!this.isFormValid() || this.isSaving()) return;
    this.isSaving.set(true);

    const dto: CreateDevelopmentPlanRequest = {
      employeeId: this.employeeId,
      title: this.title.trim(),
      description: this.description.trim() || null,
      targetSkills: this.targetSkillsArray().length > 0 ? this.targetSkillsArray().join(', ') : null,
      startDate: this.startDate,
      targetDate: this.targetDate,
      status: this.status,
      notes: this.milestones.trim() || null,
    };

    const request$ = this.isEdit
      ? this.developmentPlansService.update(this.data.plan!.id, dto)
      : this.developmentPlansService.create(dto);

    request$.subscribe({
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
