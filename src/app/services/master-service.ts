
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // =========================
  // Skills
  // =========================

  getSkills(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/skills`,
      { headers: this.getHeaders() }
    );
  }

  getSkill(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/skills/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createSkill(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/skills`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateSkill(id: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/skills/${id}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  deleteSkill(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/skills/${id}`,
      { headers: this.getHeaders() }
    );
  }


  // =========================
  // Departments
  // =========================

  getDepartments(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/departments`,
      { headers: this.getHeaders() }
    );
  }

  getDepartment(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/departments/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createDepartment(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/departments`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateDepartment(id: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/departments/${id}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/departments/${id}`,
      { headers: this.getHeaders() }
    );
  }


  // =========================
  // Designations
  // =========================

  getDesignations(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/designations`,
      { headers: this.getHeaders() }
    );
  }

  getDesignation(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/designations/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createDesignation(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/designations`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateDesignation(id: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/designations/${id}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  deleteDesignation(id: number): Observable<any> {
  return this.http.delete(
    `${this.apiUrl}/designations/${id}`,
    { headers: this.getHeaders() }
  );
}
}
