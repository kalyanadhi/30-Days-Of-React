import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreateEvaluationRequest,
  PerformanceEvaluation,
  UpdateEvaluationRequest,
} from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/evaluations`;

  findAll(employeeId?: string): Observable<PerformanceEvaluation[]> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    return this.http.get<PerformanceEvaluation[]>(this.baseUrl, { params });
  }

  findOne(id: string): Observable<PerformanceEvaluation> {
    return this.http.get<PerformanceEvaluation>(`${this.baseUrl}/${id}`);
  }

  findByEmployee(employeeId: string): Observable<PerformanceEvaluation[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<PerformanceEvaluation[]>(this.baseUrl, { params });
  }

  create(dto: CreateEvaluationRequest): Observable<PerformanceEvaluation> {
    return this.http.post<PerformanceEvaluation>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateEvaluationRequest): Observable<PerformanceEvaluation> {
    return this.http.patch<PerformanceEvaluation>(`${this.baseUrl}/${id}`, dto);
  }
}
