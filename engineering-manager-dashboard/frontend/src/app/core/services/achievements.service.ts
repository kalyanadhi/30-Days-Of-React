import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Achievement, CreateAchievementRequest } from '../models/achievement.model';

@Injectable({ providedIn: 'root' })
export class AchievementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/achievements`;

  findAll(employeeId?: string): Observable<Achievement[]> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    return this.http.get<Achievement[]>(this.baseUrl, { params });
  }

  findByEmployee(employeeId: string): Observable<Achievement[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<Achievement[]>(this.baseUrl, { params });
  }

  create(dto: CreateAchievementRequest): Observable<Achievement> {
    return this.http.post<Achievement>(this.baseUrl, dto);
  }
}
