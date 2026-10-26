import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Employee } from '../../../services/employee';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view',
  imports: [CommonModule,RouterLink],
  templateUrl: './view.html',
  styleUrl: './view.css',
})
export class View {
  employee: any = null;
  skills: any[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private employeeService: Employee
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid employee ID.';
      this.loading = false;
      return;
    }

    this.loadEmployee(id);
  }

  loadEmployee(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.employeeService.getEmployee(id).subscribe({
      next: (res: any) => {
        this.employee = res.data?.employee ?? null;
        this.skills = res.data?.skills ?? [];

        if (!this.employee) {
          this.errorMessage = 'Employee not found.';
        }

        this.loading = false;
      },
      error: (err:any) => {
        console.error('Employee details error:', err);

        this.errorMessage =
          err.status === 404
            ? 'Employee not found.'
            : err.error?.message || 'Failed to load employee details.';

        this.loading = false;
      },
    });
  }

  getStatusLabel(status: number): string {
    const statuses: Record<number, string> = {
      0: 'Available',
      1: 'Allocated',
      2: 'Partially Available',
      3: 'Unavailable',
    };

    return statuses[status] ?? 'Unknown';
  }

  getStatusClass(status: number): string {
    const classes: Record<number, string> = {
      0: 'status-available',
      1: 'status-allocated',
      2: 'status-partial',
      3: 'status-unavailable',
    };

    return classes[status] ?? 'status-unknown';
  }

  goBack(): void {
    window.history.back();
  }
}
