
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-edit-department',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class EditDepartmentComponent implements OnInit {

  departmentId!: number;

  department = {
    name: '',
    description: ''
  };

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.departmentId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.departmentId) {
      this.errorMessage = 'Invalid department ID.';
      this.loading = false;
      return;
    }

    this.loadDepartment();
  }

  loadDepartment(): void {
    this.loading = true;
    this.errorMessage = '';

    this.masterDataService
      .getDepartment(this.departmentId)
      .subscribe({
        next: (res: any) => {

          const data = res.data;

          this.department = {
            name: data?.name || '',
            description: data?.description || ''
          };

          this.loading = false;
        },

        error: (err: any) => {
          this.errorMessage =
            err.error?.message ||
            'Failed to load department.';

          this.loading = false;
        }
      });
  }

  updateDepartment(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const name = this.department.name.trim();

    if (!name) {
      this.errorMessage = 'Department name is required.';
      return;
    }

    this.saving = true;

    const payload = {
      name: name,
      description: this.department.description?.trim() || ''
    };

    this.masterDataService
      .updateDepartment(this.departmentId, payload)
      .subscribe({

        next: (res: any) => {

          this.saving = false;

          this.successMessage =
            res.message ||
            'Department updated successfully.';

          setTimeout(() => {
            this.router.navigate([
              '/dashboard/departments'
            ]);
          }, 800);
        },

        error: (err: any) => {

          this.saving = false;

          if (err.error?.errors) {
            const errors = err.error.errors;

            this.errorMessage =
              Object.values(errors)
                .flat()
                .join(' ');
          } else {
            this.errorMessage =
              err.error?.message ||
              'Failed to update department.';
          }
        }
      });
  }
}
