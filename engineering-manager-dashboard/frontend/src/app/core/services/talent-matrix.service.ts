import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TalentMatrixEntry, UpsertTalentMatrixRequest } from '../models/talent-matrix.model';

@Injectable({ providedIn: 'root' })
export class TalentMatrixService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/talent-matrix`;

  findAll(year?: number, quarter?: string): Observable<TalentMatrixEntry[]> {
    let params = new HttpParams();
    if (year !== undefined) {
      params = params.set('year', String(year));
    }
    if (quarter) {
      params = params.set('quarter', quarter);
    }
    return this.http.get<TalentMatrixEntry[]>(this.baseUrl, { params });
  }

  getHeatmap(): Observable<TalentMatrixEntry[]> {
    return this.http.get<TalentMatrixEntry[]>(this.baseUrl);
  }

  upsert(dto: UpsertTalentMatrixRequest): Observable<TalentMatrixEntry> {
    return this.http.post<TalentMatrixEntry>(this.baseUrl, dto);
  }
}
