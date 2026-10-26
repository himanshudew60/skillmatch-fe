import { Component } from '@angular/core';
import { User } from '../../../services/user';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchText = '';
  loading = true;
  errorMessage = '';

  constructor(private userService: User) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.users = res.data ?? [];
        this.filterUsers();
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load users.';
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredUsers = this.users.filter(user =>
      [
        user.user_id,
        user.emp_code,
        user.emp_name,
        user.emp_email,
        user.department_name,
        user.role_name
      ].some(value =>
        String(value ?? '').toLowerCase().includes(search)
      )
    );
  }
}
