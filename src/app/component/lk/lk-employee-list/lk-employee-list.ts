import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LkService } from '../../../services/lk';

@Component({
  selector: 'app-lk-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './lk-employee-list.html',
  styleUrls: ['./lk-employee-list.css']
})
export class LkEmployeeList implements OnInit {

  employees: any[] = [];

  searchText = '';

  loading = false;
  errorMessage = '';

  constructor(
    private lkService: LkService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {

    this.loading = true;
    this.errorMessage = '';

    this.lkService.getEmployees(this.searchText).subscribe({

      next: (res: any) => {

        this.employees = res.data || [];

        this.loading = false;
      },

      error: (err: any) => {

        console.error('Failed to load L&K employees:', err);

        this.errorMessage =
          err.error?.message ||
          'Failed to load employees.';

        this.loading = false;
      }
    });
  }

  searchEmployees(): void {
    this.loadEmployees();
  }

  clearSearch(): void {
    this.searchText = '';
    this.loadEmployees();
  }

  reviewEmployee(employeeId: number): void {
    this.router.navigate([
      '/dashboard/lk/review',
      employeeId
    ]);
  }

  getResourceStatus(status: number): string {

    switch (Number(status)) {

      case 0:
        return 'Available';

      case 1:
        return 'Allocated';

      case 2:
        return 'Partially Available';

      default:
        return 'Unknown';
    }
  }
}