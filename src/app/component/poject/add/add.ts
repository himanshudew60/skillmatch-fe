import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../services/project';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class AddProjectComponent implements OnInit {

  departments: any[] = [];
  employees: any[] = [];

  project = {
    project_name: '',
    description: '',
    client_name: '',
    department_id: null as number | null,
    project_manager_id: null as number | null,
    start_date: '',
    end_date: '',
    status: 'Draft'
  };

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
  }

  loadDepartments(): void {
    this.projectService.getDepartments().subscribe({
      next: (res: any) => {
        this.departments = res.data ?? [];
      },
      error: () => {
        this.errorMessage = 'Failed to load departments.';
      }
    });
  }

  loadEmployees(): void {
    this.projectService.getEmployees().subscribe({
      next: (res: any) => {
        this.employees = res.data ?? [];
      },
      error: () => {
        this.errorMessage = 'Failed to load employees.';
      }
    });
  }

  saveProject(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.project.project_name.trim()) {
      this.errorMessage = 'Project name is required.';
      return;
    }

    if (
      this.project.start_date &&
      this.project.end_date &&
      this.project.end_date < this.project.start_date
    ) {
      this.errorMessage =
        'End date cannot be before start date.';
      return;
    }

    this.saving = true;

    this.projectService.createProject(this.project).subscribe({
      next: (res: any) => {

        this.saving = false;

        this.successMessage =
          res.message || 'Project created successfully.';

        setTimeout(() => {
          this.router.navigate(['/dashboard/projects']);
        }, 700);
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
            'Failed to create project.';
        }
      }
    });
  }
}