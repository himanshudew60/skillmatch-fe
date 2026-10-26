import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProjects() {
    return this.http.get<any>(
      `${this.apiUrl}/projects`,
      { headers: this.getHeaders() }
    );
  }

  getProject(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/projects/${id}`,
      { headers: this.getHeaders() }
    );
  }

  createProject(payload: any) {
    return this.http.post<any>(
      `${this.apiUrl}/projects`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  updateProject(id: number, payload: any) {
    return this.http.put<any>(
      `${this.apiUrl}/projects/${id}`,
      payload,
      { headers: this.getHeaders() }
    );
  }

  deleteProject(id: number) {
    return this.http.delete<any>(
      `${this.apiUrl}/projects/${id}`,
      { headers: this.getHeaders() }
    );
  }

  getDepartments() {
    return this.http.get<any>(
      `${this.apiUrl}/getDepartments`,
      { headers: this.getHeaders() }
    );
  }

  getEmployees() {
    return this.http.get<any>(
      `${this.apiUrl}/employees`,
      { headers: this.getHeaders() }
    );
  }
}