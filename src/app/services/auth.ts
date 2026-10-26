import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
 private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(params: any) {
    return this.http.post(`${this.baseUrl}/login`, params);
  }

  me() {
     const token = localStorage.getItem('access_token');
     return this.http.get(`${this.baseUrl}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  }

  logout() {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  

}
