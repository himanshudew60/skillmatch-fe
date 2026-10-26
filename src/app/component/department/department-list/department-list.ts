
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css'
})
export class DepartmentListComponent implements OnInit {

  departments: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {

    this.loading = true;

    this.masterDataService.getDepartments().subscribe({

      next: (res: any) => {
        this.departments = res.data ?? [];
        this.loading = false;
      },

      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load departments.';
        this.loading = false;
      }
    });
  }

  deleteDepartment(id: number): void {

    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    this.masterDataService.deleteDepartment(id).subscribe({

      next: (res: any) => {
        this.successMessage =
          res.message || 'Department deleted successfully.';
        this.loadDepartments();
      },

      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to delete department.';
      }
    });
  }
}
