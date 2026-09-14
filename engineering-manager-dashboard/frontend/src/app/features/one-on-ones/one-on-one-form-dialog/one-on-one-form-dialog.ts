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
import { OneOnOnesService } from '../../../core/services/one-on-ones.service';
import { EmployeesService } from '../../../core/services/employees.service';
import { OneOnOne, CreateOneOnOneRequest } from '../../../core/models/one-on-one.model';
import { Employee } from '../../../core/models/employee.model';

export interface OneOnOneFormDialogData {
  oneOnOne?: OneOnOne;
  employeeId?: string;
}

@Component({
  selector: 'app-one-on-one-form-dialog',
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
  templateUrl: './one-on-one-form-dialog.html',
})
export class OneOnOneFormDialog {
  private readonly dialogRef = inject(MatDialogRef<OneOnOneFormDialog>);
  readonly data = inject<OneOnOneFormDialogData>(MAT_DIALOG_DATA);
  private readonly oneOnOnesService = inject(OneOnOnesService);
  private readonly employeesService = inject(EmployeesService);

  readonly employees = signal<Employee[]>([]);
  readonly isLoadingEmployees = signal(true);
  readonly isSaving = signal(false);
  readonly actionItems = signal<string[]>([...(this.data.oneOnOne?.actionItems ?? [])]);

  readonly isEdit = !!this.data.oneOnOne;
  readonly employeeIdDisabled = !!this.data.employeeId;

  employeeId = this.data.employeeId ?? this.data.oneOnOne?.employeeId ?? '';
  meetingDate = this.data.oneOnOne?.meetingDate ?? '';
  notes = this.data.oneOnOne?.discussionNotes ?? '';
  followUpDate = this.data.oneOnOne?.followUpDate ?? '';
  newActionItem = '';

  constructor() {
    this.employeesService.findAll().subscribe({
      next: (data) => {
        this.employees.set(data);
        this.isLoadingEmployees.set(false);
      },
      error: () => this.isLoadingEmployees.set(false),
    });
  }

  addActionItem(): void {
    const val = this.newActionItem.trim();
    if (!val) return;
    this.actionItems.update((items) => [...items, val]);
    this.newActionItem = '';
  }

  removeActionItem(index: number): void {
    this.actionItems.update((items) => items.filter((_, i) => i !== index));
  }

  isFormValid(): boolean {
    return !!this.employeeId && !!this.meetingDate;
  }

  submit(): void {
    if (!this.isFormValid() || this.isSaving()) return;
    this.isSaving.set(true);

    const dto: CreateOneOnOneRequest = {
      employeeId: this.employeeId,
      meetingDate: this.meetingDate,
      discussionNotes: this.notes.trim() || null,
      concerns: this.data.oneOnOne?.concerns ?? null,
      careerDiscussion: this.data.oneOnOne?.careerDiscussion ?? null,
      actionItems: this.actionItems().length > 0 ? this.actionItems() : null,
      followUpDate: this.followUpDate || null,
    };

    const request$ = this.isEdit
      ? this.oneOnOnesService.update(this.data.oneOnOne!.id, dto)
      : this.oneOnOnesService.create(dto);

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
