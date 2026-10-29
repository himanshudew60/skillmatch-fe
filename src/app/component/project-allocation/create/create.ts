
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectAllocationService } from '../../../services/project-allocation';

@Component({
  selector: 'app-allocate-employee',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create.html',
  styleUrl: './create.css'
})
export class AllocateEmployee implements OnInit {
  projects: any[] = [];
  employees: any[] = [];
  taggedEmployees: any[] = [];
  availableEmployees: any[] = [];

  private projectIdFromUrl = '';

  loading = false;
  submitted = false;
  loadingProject = true;
  loadingEmployees = true;

  errorMessage = '';
  successMessage = '';

  form = {
    project_id: '',
    employee_id: '',
    start_date: '',
    end_date: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProjectAllocationService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const projectId = params.get('project_id');

      this.errorMessage = '';
      this.successMessage = '';

      if (!projectId || !Number.isInteger(Number(projectId)) ||
          Number(projectId) <= 0) {
        this.errorMessage = 'A valid project ID is missing from the URL.';
        this.loadingProject = false;
        return;
      }

      this.projectIdFromUrl = projectId;
      this.form.project_id = projectId;

      this.loadProjects();
      this.loadTaggedEmployees();
      this.loadEmployees();
    });
  }

  loadProjects(): void {
    this.loadingProject = true;

    this.service.getAllocations().subscribe({
      next: (res: any) => {
        this.projects = res?.success ? (res.data ?? []) : [];

        if (!this.selectedProject) {
          this.errorMessage =
            res?.message || 'The selected project could not be found.';
        }

        this.loadingProject = false;
      },
      error: (err: any) => {
        this.loadingProject = false;
        this.errorMessage =
          err.error?.message || 'Unable to load project details.';
      }
    });
  }

  loadTaggedEmployees(): void {
    this.service
      .getProjectAllocations(Number(this.projectIdFromUrl))
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            this.taggedEmployees = res.data ?? [];
            this.filterAvailableEmployees();
          } else {
            this.errorMessage =
              res?.message || 'Unable to load allocated employees.';
          }
        },
        error: (err: any) => {
          this.errorMessage =
            err.error?.message || 'Unable to load allocated employees.';
        }
      });
  }

  loadEmployees(): void {
    this.loadingEmployees = true;

    this.service.getEligibleEmployees().subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.employees = res.data ?? [];
          this.filterAvailableEmployees();
        } else {
          this.errorMessage =
            res?.message || 'Unable to load approved employees.';
        }

        this.loadingEmployees = false;
      },
      error: (err: any) => {
        this.loadingEmployees = false;
        this.errorMessage =
          err.error?.message || 'Unable to load approved employees.';
      }
    });
  }

  filterAvailableEmployees(): void {
    const taggedEmployeeIds = new Set(
      this.taggedEmployees.map(employee => Number(employee.employee_id))
    );

    this.availableEmployees = this.employees.filter(
      employee => !taggedEmployeeIds.has(Number(employee.id))
    );

    // Clear the selection if it is no longer available.
    if (
      this.form.employee_id &&
      !this.availableEmployees.some(
        employee => Number(employee.id) === Number(this.form.employee_id)
      )
    ) {
      this.form.employee_id = '';
    }
  }

  get selectedProject(): any | undefined {
    return this.projects.find(
      project => Number(project.id) === Number(this.form.project_id)
    );
  }

  get remainingSlots(): number {
    if (!this.selectedProject) {
      return 0;
    }

    const capacity = Number(
      this.selectedProject.required_resources ?? 0
    );

    return Math.max(0, capacity - this.taggedEmployees.length);
  }

 

  cancel(): void {
    this.router.navigate(['/project-allocations']);
  }
  // Multi-select employee allocation properties
selectedEmployeeIds: number[] = [];





get selectedEmployeeCount(): number {
  return this.selectedEmployeeIds.length;
}

isEmployeeSelected(employeeId: number): boolean {
  return this.selectedEmployeeIds.includes(Number(employeeId));
}

toggleEmployee(employeeId: number, event: Event): void {
  const checked = (event.target as HTMLInputElement).checked;
  const id = Number(employeeId);

  if (checked) {
    if (this.selectedEmployeeIds.includes(id)) {
      return;
    }

    if (this.selectedEmployeeIds.length >= this.remainingSlots) {
      (event.target as HTMLInputElement).checked = false;
      return;
    }

    this.selectedEmployeeIds = [...this.selectedEmployeeIds, id];
  } else {
    this.selectedEmployeeIds = this.selectedEmployeeIds.filter(
      employeeId => employeeId !== id
    );
  }
}

submitForm(ngForm?: NgForm): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.selectedEmployeeIds.length === 0) {
    this.errorMessage = 'Please select at least one approved employee.';
    return;
  }

  if (this.selectedEmployeeIds.length > this.remainingSlots) {
    this.errorMessage = `You can allocate only ${this.remainingSlots} more employee(s).`;
    return;
  }

  if (!this.form.start_date || !this.form.end_date) {
    this.errorMessage = 'Please select both start and end dates.';
    return;
  }

  if (this.form.start_date > this.form.end_date) {
    this.errorMessage = 'End date must be on or after start date.';
    return;
  }

  this.loading = true;

  this.service.createBulkAllocations({
    project_id: Number(this.form.project_id),
    employee_ids: this.selectedEmployeeIds,
    start_date: this.form.start_date,
    end_date: this.form.end_date
  }).subscribe({
    next: (res: any) => {
      this.loading = false;

      if (res?.success) {
        this.successMessage =
          res.message || 'Employees allocated successfully.';

        this.selectedEmployeeIds = [];
        this.form.start_date = '';
        this.form.end_date = '';

        this.loadTaggedEmployees();
        this.loadEmployees();
      } else {
        this.errorMessage = res?.message || 'Unable to allocate employees.';
      }
    },
    error: (err: any) => {
      this.loading = false;
      this.errorMessage =
        err.error?.message || 'Unable to allocate employees.';
    }
  });
}

}
