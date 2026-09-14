import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LearningActivity,
  CreateLearningActivityRequest,
  UpdateLearningActivityRequest,
} from '../models/learning.model';

@Injectable({ providedIn: 'root' })
export class LearningService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/learning`;

  findAll(employeeId?: string): Observable<LearningActivity[]> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    return this.http.get<LearningActivity[]>(this.baseUrl, { params });
  }

  findByEmployee(employeeId: string): Observable<LearningActivity[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<LearningActivity[]>(this.baseUrl, { params });
  }

  create(dto: CreateLearningActivityRequest): Observable<LearningActivity> {
    return this.http.post<LearningActivity>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateLearningActivityRequest): Observable<LearningActivity> {
    return this.http.patch<LearningActivity>(`${this.baseUrl}/${id}`, dto);
  }
}
