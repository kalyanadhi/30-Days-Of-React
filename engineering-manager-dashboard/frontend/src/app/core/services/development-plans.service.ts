import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateDevelopmentPlanRequest, DevelopmentPlan, UpdateDevelopmentPlanRequest } from '../models/development-plan.model';

@Injectable({ providedIn: 'root' })
export class DevelopmentPlansService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/development-plans`;

  findAll(employeeId?: string): Observable<DevelopmentPlan[]> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    return this.http.get<DevelopmentPlan[]>(this.baseUrl, { params });
  }

  findByEmployee(employeeId: string): Observable<DevelopmentPlan[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<DevelopmentPlan[]>(this.baseUrl, { params });
  }

  create(dto: CreateDevelopmentPlanRequest): Observable<DevelopmentPlan> {
    return this.http.post<DevelopmentPlan>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateDevelopmentPlanRequest): Observable<DevelopmentPlan> {
    return this.http.patch<DevelopmentPlan>(`${this.baseUrl}/${id}`, dto);
  }
}
