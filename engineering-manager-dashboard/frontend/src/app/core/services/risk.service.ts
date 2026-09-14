import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RiskAssessment,
  RiskHeatmap,
  CreateRiskAssessmentRequest,
  UpdateRiskAssessmentRequest,
} from '../models/risk.model';

@Injectable({ providedIn: 'root' })
export class RiskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/risk`;

  getHeatmap(): Observable<RiskHeatmap> {
    return this.http.get<RiskHeatmap>(`${this.baseUrl}/heatmap`);
  }

  findByEmployee(employeeId: string): Observable<RiskAssessment> {
    return this.http.get<RiskAssessment>(`${this.baseUrl}/employee/${employeeId}`);
  }

  create(dto: CreateRiskAssessmentRequest): Observable<RiskAssessment> {
    return this.http.post<RiskAssessment>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateRiskAssessmentRequest): Observable<RiskAssessment> {
    return this.http.patch<RiskAssessment>(`${this.baseUrl}/${id}`, dto);
  }
}
