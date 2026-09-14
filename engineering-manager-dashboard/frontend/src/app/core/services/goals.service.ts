import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateGoalRequest, Goal, UpdateGoalRequest } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/goals`;

  findAll(employeeId?: string): Observable<Goal[]> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    return this.http.get<Goal[]>(this.baseUrl, { params });
  }

  findByEmployee(employeeId: string): Observable<Goal[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<Goal[]>(this.baseUrl, { params });
  }

  create(dto: CreateGoalRequest): Observable<Goal> {
    return this.http.post<Goal>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateGoalRequest): Observable<Goal> {
    return this.http.patch<Goal>(`${this.baseUrl}/${id}`, dto);
  }
}
