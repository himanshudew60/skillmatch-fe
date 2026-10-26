import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Employee {

  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  /**
   * JWT Headers
   */
  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('access_token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    });
  }


  // =========================================================
  // Departments
  // =========================================================

  getDepartments() {

    return this.http.get(
      `${this.baseUrl}/getDepartments`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =========================================================
  // Designations
  // =========================================================

  getDesignations() {

    return this.http.get(
      `${this.baseUrl}/getDesignations`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =========================================================
  // Skills
  // =========================================================

  getSkills() {

    return this.http.get(
      `${this.baseUrl}/getSkills`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =========================================================
  // Create Employee
  // =========================================================

  createEmployee(payload: any) {

    return this.http.post(
      `${this.baseUrl}/employees`,
      payload,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =========================================================
  // Get Employees
  // =========================================================

  getEmployees() {

    return this.http.get(
      `${this.baseUrl}/employees`,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =========================================================
  // Get Single Employee
  // =========================================================

  getEmployee(id: number) {
  return this.http.get<any>(
    `${this.baseUrl}/employees/${id}`,
    { headers: this.getHeaders() }
  );
}


  // =========================================================
  // Update Employee
  // =========================================================

  updateEmployee(id: number, payload: any) {

    return this.http.put(
      `${this.baseUrl}/employees/${id}`,
      payload,
      {
        headers: this.getHeaders()
      }
    );

  }


  // =========================================================
  // Delete Employee
  // =========================================================

  deleteEmployee(id: number) {

    return this.http.delete(
      `${this.baseUrl}/employees/${id}`,
      {
        headers: this.getHeaders()
      }
    );

  }


  importEmployees(file: File) {

    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(
      `${this.baseUrl}/employees/import`,
      formData,
      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          Accept: 'application/json'
        })
      }
    );
  }

}