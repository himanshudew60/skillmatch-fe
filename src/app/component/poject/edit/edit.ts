import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../../services/project';

@Component({
  selector: 'app-edit-project',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class EditProjectComponent implements OnInit {

  projectId!: number;

  departments: any[] = [];
  employees: any[] = [];

  project = {
    project_code: '',
    project_name: '',
    description: '',
    client_name: '',
    department_id: null as number | null,
    project_manager_id: null as number | null,
    start_date: '',
    end_date: '',
    status: 'Draft'
  };

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.projectId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.projectId) {
      this.errorMessage = 'Invalid project ID.';
      this.loading = false;
      return;
    }

    this.loadDepartments();
    this.loadEmployees();
    this.loadProject();
  }

  loadProject(): void {

    this.projectService.getProject(this.projectId).subscribe({

      next: (res: any) => {

        const data = res.data;

        this.project = {
          project_code: data.project_code || '',
          project_name: data.project_name || '',
          description: data.description || '',
          client_name: data.client_name || '',
          department_id: data.department_id
            ? Number(data.department_id)
            : null,
          project_manager_id: data.project_manager_id
            ? Number(data.project_manager_id)
            : null,
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          status: data.status || 'Draft'
        };

        this.loading = false;
      },

      error: (err: any) => {

        this.errorMessage =
          err.error?.message ||
          'Failed to load project.';

        this.loading = false;
      }
    });
  }

  loadDepartments(): void {

    this.projectService.getDepartments().subscribe({

      next: (res: any) => {
        this.departments = res.data ?? [];
      },

      error: () => {
        this.errorMessage =
          'Failed to load departments.';
      }
    });
  }

  loadEmployees(): void {

    this.projectService.getEmployees().subscribe({

      next: (res: any) => {
        this.employees = res.data ?? [];
      },

      error: () => {
        this.errorMessage =
          'Failed to load employees.';
      }
    });
  }

  updateProject(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.project.project_name.trim()) {
      this.errorMessage =
        'Project name is required.';
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

    const payload = {
      project_name: this.project.project_name,
      description: this.project.description,
      client_name: this.project.client_name,
      department_id: this.project.department_id,
      project_manager_id: this.project.project_manager_id,
      start_date: this.project.start_date,
      end_date: this.project.end_date,
      status: this.project.status
    };

    this.projectService
      .updateProject(this.projectId, payload)
      .subscribe({

        next: (res: any) => {

          this.saving = false;

          this.successMessage =
            res.message ||
            'Project updated successfully.';

          setTimeout(() => {
            this.router.navigate([
              '/dashboard/projects'
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
              'Failed to update project.';
          }
        }
      });
  }
}