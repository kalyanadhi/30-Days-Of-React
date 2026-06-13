import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEmployeeRequest, Employee, UpdateEmployeeRequest } from '../models/employee.model';

export interface EmployeeQuery {
  search?: string;
  department?: string;
  project?: string;
  gradeBand?: string;
  managerId?: string;
}

@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  findAll(query: EmployeeQuery = {}): Observable<Employee[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return this.http.get<Employee[]>(this.baseUrl, { params });
  }

  getDepartments(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/departments`);
  }

  findOne(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  findTeam(id: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.baseUrl}/${id}/team`);
  }

  create(dto: CreateEmployeeRequest): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateEmployeeRequest): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
