import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../services/user';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add',
  imports: [FormsModule,CommonModule,FormsModule,RouterLink],
  templateUrl: './add.html',
  styleUrl: './add.css',
})
export class Add {
  filteredEmployees: any[] = [];
showEmployeeDropdown = false;
employees: any[] = [];
  roles: any[] = [];

  employeeSearch = '';
  selectedEmployeeId: number | null = null;
  selectedEmployee: any = null;

  userId = '';
  password = '';
  roleId: number | null = null;

  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: User,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;

    this.userService.getRoles().subscribe({
      next: (res: any) => {
        this.roles = res.data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load roles.';
        this.loading = false;
      }
    });

    this.searchEmployees();
  }

  
searchEmployees(): void {
  this.userService
    .getAvailableEmployees(this.employeeSearch)
    .subscribe({
      next: (res: any) => {
        this.employees = res.data ?? [];
        this.filterEmployees();
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load employees.';
      }
    });
}

filterEmployees(): void {
  const search = this.employeeSearch.trim().toLowerCase();

  this.filteredEmployees = this.employees.filter(employee =>
    [
      employee.emp_name,
      employee.emp_code,
      employee.emp_email,
      employee.department_name
    ].some(value =>
      String(value ?? '').toLowerCase().includes(search)
    )
  );

  this.showEmployeeDropdown = true;
}

selectEmployee(employee: any): void {
  this.selectedEmployeeId = Number(employee.id);
  this.selectedEmployee = employee;
  this.employeeSearch =
    `${employee.emp_name} (${employee.emp_code})`;

  this.userId = employee.emp_code || '';
  this.showEmployeeDropdown = false;
}

clearEmployee(): void {
  this.selectedEmployeeId = null;
  this.selectedEmployee = null;
  this.employeeSearch = '';
  this.userId = '';
  this.filteredEmployees = [...this.employees];
  this.showEmployeeDropdown = true;
}

closeEmployeeDropdown(): void {
  // Delay closing so the employee click can complete.
  setTimeout(() => {
    this.showEmployeeDropdown = false;
  }, 150);
}




  

  saveUser(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedEmployeeId || !this.roleId) {
      this.errorMessage = 'Please select an employee and a role.';
      return;
    }

    if (!this.userId.trim() || this.password.length < 8) {
      this.errorMessage =
        'Enter a login ID and a password of at least 8 characters.';
      return;
    }

    this.saving = true;

    this.userService.createUser({
      employee_id: this.selectedEmployeeId,
      role_id: Number(this.roleId),
      user_id: this.userId.trim(),
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.successMessage =
          res.message || 'User account created successfully.';

        this.saving = false;

        this.router.navigate(['/dashboard/users']);
      },
      error: (err: any) => {
        this.saving = false;

        if (err.status === 422 && err.error?.errors) {
          const errors = err.error.errors;
          this.errorMessage = Object.values(errors)
            .flat()
            .join(' ');
        } else {
          this.errorMessage =
            err.error?.message || 'Failed to create user account.';
        }
      }
    });
  }
}
