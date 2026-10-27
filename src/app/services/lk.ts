
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LkService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
  }
  
sendToUpskill(payload: {
  employee_id: number;
  skills: {
    employee_skill_id: number | null;
    skill_id: number;
    required_proficiency: number;
    feedback: string;
  }[];
}) {
  return this.http.post<any>(
    `${this.apiUrl}/lk/upskill-requests`,
    payload,
    {
      headers: this.getHeaders()
    }
  );
}


  // =========================
  // L&K Employees
  // =========================

  getEmployees(search = '') {
    const params = new HttpParams().set('search', search);

    return this.http.get<any>(
      `${this.apiUrl}/lk/employees`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  // =========================
  // Employee Skills
  // =========================

  getEmployeeSkills(employeeId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/lk/employees/${employeeId}/skills`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================
  // L&K Skill Assessment
  // =========================

  submitSkillAssessment(payload: {
    employee_id: number;
    skills: any[];
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/lk/skill-assessments`,
      payload,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================
  // Upskill Requests
  // =========================

  getUpskillRequests() {
    return this.http.get<any>(
      `${this.apiUrl}/lk/upskill-requests`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getUpskillRequest(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/lk/upskill-requests/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================
  // Upskill Assessment
  // =========================

  submitUpskillAssessment(
    id: number,
    payload: any
  ) {
    return this.http.post<any>(
      `${this.apiUrl}/lk/upskill-requests/${id}/assessment`,
      payload,
      {
        headers: this.getHeaders()
      }
    );
  }


}