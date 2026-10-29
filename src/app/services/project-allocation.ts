
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProjectAllocationService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
  }

  getAllocations() {
    return this.http.get<any>(
      `${this.apiUrl}/project-allocations`,
      { headers: this.getHeaders() }
    );
  }

  getEligibleEmployees() {
    return this.http.get<any>(
      `${this.apiUrl}/project-allocations/eligible-employees`,
      { headers: this.getHeaders() }
    );
  }

  getProjectAllocations(projectId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/projects/${projectId}/allocations`,
      { headers: this.getHeaders() }
    );
  }

  createAllocation(data: {
    project_id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/project-allocations`,
      data,
      { headers: this.getHeaders() }
    );
  }

  getAllocation(id: number) {
    return this.http.get<any>(
      `${this.apiUrl}/project-allocations/${id}`,
      { headers: this.getHeaders() }
    );
  }

  updateAllocation(id: number, data: {
    project_id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
  }) {
    return this.http.put<any>(
      `${this.apiUrl}/project-allocations/${id}`,
      data,
      { headers: this.getHeaders() }
    );
  }

  releaseAllocation(id: number) {
    return this.http.delete<any>(
      `${this.apiUrl}/project-allocations/${id}`,
      { headers: this.getHeaders() }
    );
  }
  
updateProjectAllocations(
  projectId: number,
  allocations: {
    id: number;
    start_date: string;
    end_date: string;
  }[]
) {
  return this.http.put<any>(
    `${this.apiUrl}/projects/${projectId}/allocations/bulk-update`,
    { allocations },
    { headers: this.getHeaders() }
  );
}

releaseProjectAllocations(
  projectId: number,
  allocationIds: number[]
) {
  return this.http.post<any>(
    `${this.apiUrl}/projects/${projectId}/allocations/bulk-release`,
    { allocation_ids: allocationIds },
    { headers: this.getHeaders() }
  );
}
createBulkAllocations(data: {
  project_id: number;
  employee_ids: number[];
  start_date: string;
  end_date: string;
}) {
  return this.http.post<any>(
    `${this.apiUrl}/project-allocations/bulk`,
    data,
    { headers: this.getHeaders() }
  );
}

}
