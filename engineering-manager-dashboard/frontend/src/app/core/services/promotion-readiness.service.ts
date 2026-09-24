import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PromotionReadiness,
  PromotionReadinessDashboard,
  CreatePromotionReadinessRequest,
  UpdatePromotionReadinessRequest,
} from '../models/promotion-readiness.model';

@Injectable({ providedIn: 'root' })
export class PromotionReadinessService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/promotion-readiness`;

  getDashboard(): Observable<PromotionReadinessDashboard> {
    return this.http.get<PromotionReadinessDashboard>(`${this.baseUrl}/dashboard`);
  }

  findByEmployee(employeeId: string): Observable<PromotionReadiness> {
    return this.http.get<PromotionReadiness>(`${this.baseUrl}/employee/${employeeId}`);
  }

  create(dto: CreatePromotionReadinessRequest): Observable<PromotionReadiness> {
    return this.http.post<PromotionReadiness>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdatePromotionReadinessRequest): Observable<PromotionReadiness> {
    return this.http.patch<PromotionReadiness>(`${this.baseUrl}/${id}`, dto);
  }
}
