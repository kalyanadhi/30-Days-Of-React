import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOneOnOneRequest, OneOnOne, UpdateOneOnOneRequest } from '../models/one-on-one.model';

@Injectable({ providedIn: 'root' })
export class OneOnOnesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/one-on-ones`;

  findAll(employeeId?: string): Observable<OneOnOne[]> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId);
    }
    return this.http.get<OneOnOne[]>(this.baseUrl, { params });
  }

  findByEmployee(employeeId: string): Observable<OneOnOne[]> {
    const params = new HttpParams().set('employeeId', employeeId);
    return this.http.get<OneOnOne[]>(this.baseUrl, { params });
  }

  create(dto: CreateOneOnOneRequest): Observable<OneOnOne> {
    return this.http.post<OneOnOne>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateOneOnOneRequest): Observable<OneOnOne> {
    return this.http.patch<OneOnOne>(`${this.baseUrl}/${id}`, dto);
  }
}
