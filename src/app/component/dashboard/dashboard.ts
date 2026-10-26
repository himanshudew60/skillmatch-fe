import { CommonModule, } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { Header } from '../../utils/header/header';
import { Sidebar } from '../../utils/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, Header, Sidebar, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

  profileOpen = false;
  notificationOpen = false;
  searchText = '';
  currentDate = new Date();
  accessToken: any
  loggedUser: any
  user: any
  constructor(
    private router: Router,
    private auth: Auth
  ) { }

  
ngOnInit(): void {
  this.accessToken = localStorage.getItem('access_token');

  // No token: redirect to main page
  if (!this.accessToken) {
    this.router.navigate(['/']);
    return;
  }

  // Check whether JWT token has expired
  try {
    const payload = JSON.parse(
      atob(this.accessToken.split('.')[1])
    );

    const expirationTime = payload.exp;

    if (!expirationTime || Date.now() >= expirationTime * 1000) {
      this.logoutAndRedirect();
      return;
    }
  } catch (error) {
    // Invalid token
    this.logoutAndRedirect();
    return;
  }

  // Token is not expired: fetch user details
  this.auth.me().subscribe({
    next: (res: any) => {
      this.user = res.user;
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    error: (err: any) => {
      console.error('Failed to fetch user data:', err);

      // Redirect if token is invalid or expired
      if (err.status === 401 || err.status === 403) {
        this.logoutAndRedirect();
      }
    }
  });
}

private logoutAndRedirect(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');

  this.router.navigate(['/']);
}



  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    if (this.profileOpen) {
      this.notificationOpen = false;
    }
  }

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
    if (this.notificationOpen) {
      this.profileOpen = false;
    }
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        this.router.navigate(['/']);
      },
      error: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_type');
        localStorage.removeItem('user');
        this.router.navigate(['/']);
      }
    });
  }



  search(): void {
    const value = this.searchText.trim();
    if (!value) {
      return;
    }
    console.log('Searching:', value);
    this.router.navigate(['/dashboard/search'], {
      queryParams: {
        q: value
      }
    });
  }
















  @HostListener('document:click', ['$event'])
  documentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-container')) {
      this.profileOpen = false;
    }
    if (!target.closest('.notification-container')) {
      this.notificationOpen = false;
    }
  }
}
