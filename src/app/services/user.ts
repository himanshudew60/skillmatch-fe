import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class User {
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

  getUsers() {
    return this.http.get<any>(
      `${this.apiUrl}/users`,
      { headers: this.getHeaders() }
    );
  }

  getAvailableEmployees(search = '') {
    const params = new HttpParams().set('search', search);

    return this.http.get<any>(
      `${this.apiUrl}/users/available-employees`,
      { headers: this.getHeaders(), params }
    );
  }

  getRoles() {
    return this.http.get<any>(
      `${this.apiUrl}/user-roles`,
      { headers: this.getHeaders() }
    );
  }

  createUser(payload: {
    employee_id: number;
    role_id: number;
    user_id: string;
    password: string;
  }) {
    return this.http.post<any>(
      `${this.apiUrl}/users`,
      payload,
      { headers: this.getHeaders() }
    );
  }
}
