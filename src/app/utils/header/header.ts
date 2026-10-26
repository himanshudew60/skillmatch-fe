import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [FormsModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  profileOpen = false;
  notificationOpen = false;
  searchText = '';
  @Input() loggedUser: any;
  constructor(private router: Router, private auth: Auth) { }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    if (this.profileOpen) {
      this.notificationOpen = false;
    }
  }

  getInitials(name: string): string {
  if (!name) return '';

  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[1].charAt(0)
  ).toUpperCase();
}

  toggleNotifications(): void {
    this.notificationOpen = !this.notificationOpen;
    if (this.notificationOpen) {
      this.profileOpen = false;
    }
  }

  search(): void {
    const value = this.searchText.trim();
    if (!value) {
      return;
    }
    console.log('Searching:', value);
    this.router.navigate(
      ['/dashboard/search'],
      {
        queryParams: {
          q: value
        }
      }
    );
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
