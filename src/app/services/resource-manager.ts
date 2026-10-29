import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResourceManagerService {
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

  getRequirements(search = '') {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(
      `${this.apiUrl}/project-requirements`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }

  getRequirement(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/project-requirements/${id}`,
      { headers: this.getHeaders() }
    );
  }
  getAiRecommendations(requirementId: number) {
  return this.http.get(
    `${this.apiUrl}/resource-manager/ai-recommendations/${requirementId}`,
    { headers: this.getHeaders() }
  );
}

  getRecommendations(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/resource-manager/requirements/${id}/recommendations`,
      
    );
  }

sendUpskillRequest(payload: {
  employee_id: number;
  project_requirement_id: number;
  skills: {
    skill_id: number;
    required_proficiency: number;
    feedback: string;
  }[];
}) {
  return this.http.post<any>(
    `${this.apiUrl}/resource-manager/upskill-requests`,
    payload,
    {
      headers: this.getHeaders()
    }
  );
}
updateEmployeeStatus(employeeId: number, status: number) {
  return this.http.put(
    `${this.apiUrl}/employees/${employeeId}/status`,
    { status: status },
    {
      headers: this.getHeaders()
    }
  );
}

  reviedByManager(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/resource-manager/reviedByManager/${id}`,
      { headers: this.getHeaders() }
    );
  }

}