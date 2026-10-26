import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectRequirementService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getRequirements(projectId?: number): Observable<any> {
    let url = `${this.apiUrl}/project-requirements`;

    if (projectId) {
      url += `?project_id=${projectId}`;
    }

    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  getRequirement(id: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/project-requirements/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  createRequirement(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/project-requirements`,
      payload,
      {
        headers: this.getHeaders()
      }
    );
  }

  updateRequirement(id: number, payload: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/project-requirements/${id}`,
      payload,
      {
        headers: this.getHeaders()
      }
    );
  }

  deleteRequirement(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/project-requirements/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getProjects(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/projects`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getSkills(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/getSkills`,
      {
        headers: this.getHeaders()
      }
    );
  }
}