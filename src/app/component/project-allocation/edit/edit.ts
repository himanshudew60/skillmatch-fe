
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectAllocationService } from '../../../services/project-allocation';

@Component({
  selector: 'app-edit-allocation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class EditAllocation implements OnInit {
  projectId = 0;
  project: any = null;

  allocations: any[] = [];
  employees: any[] = [];
  availableEmployees: any[] = [];

  releaseIds: number[] = [];
  newEmployeeIds: number[] = [];

  newStartDate = '';
  newEndDate = '';

  loading = false;
  loadingData = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ProjectAllocationService
  ) {}

 ngOnInit(): void {
  const routeId = this.route.snapshot.paramMap.get('id');
  const queryId = this.route.snapshot.queryParamMap.get('project_id');

  const rawId = routeId ?? queryId;
  const id = Number(rawId);

  if (!rawId || !Number.isInteger(id) || id <= 0) {
    this.errorMessage = 'A valid project ID is required.';
    this.loadingData = false;
    return;
  }

  this.projectId = id;
  this.loadData();
}

  get remainingSlots(): number {
    const capacity = Number(this.project?.required_resources ?? 0);
    return Math.max(0, capacity - this.allocations.length);
  }

  get selectedNewCount(): number {
    return this.newEmployeeIds.length;
  }

  loadData(): void {
    this.loadingData = true;
    this.errorMessage = '';

    let pending = 3;
    const finish = () => {
      pending--;
      if (pending === 0) {
        this.filterEmployees();
        this.loadingData = false;
      }
    };

    this.service.getAllocations().subscribe({
      next: (res: any) => {
        const projects = res?.success ? (res.data ?? []) : [];
        this.project = projects.find(
          (p: any) => Number(p.id) === this.projectId
        ) ?? null;

        if (!this.project) {
          this.errorMessage = 'Project not found.';
        }

        finish();
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Unable to load project details.';
        finish();
      }
    });

    this.service.getProjectAllocations(this.projectId).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.allocations = (res.data ?? []).map((a: any) => ({
            ...a,
            start_date: this.toDateInput(a.start_date),
            end_date: this.toDateInput(a.end_date)
          }));
        } else {
          this.errorMessage =
            res?.message || 'Unable to load project allocations.';
        }
        finish();
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Unable to load project allocations.';
        finish();
      }
    });

    this.service.getEligibleEmployees().subscribe({
      next: (res: any) => {
        this.employees = res?.success ? (res.data ?? []) : [];
        finish();
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Unable to load eligible employees.';
        finish();
      }
    });
  }

  private toDateInput(value: string): string {
    return value ? value.substring(0, 10) : '';
  }

  private filterEmployees(): void {
    const allocatedIds = new Set(
      this.allocations.map(a => Number(a.employee_id))
    );

    this.availableEmployees = this.employees.filter(
      e => Number(e.status) === 4 &&
           !allocatedIds.has(Number(e.id))
    );

    this.newEmployeeIds = this.newEmployeeIds.filter(id =>
      this.availableEmployees.some(e => Number(e.id) === id)
    );
  }

  toggleRelease(allocationId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = Number(allocationId);

    this.releaseIds = checked
      ? [...new Set([...this.releaseIds, id])]
      : this.releaseIds.filter(item => item !== id);
  }

  isMarkedForRelease(allocationId: number): boolean {
    return this.releaseIds.includes(Number(allocationId));
  }

  toggleNewEmployee(employeeId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = Number(employeeId);

    if (checked) {
      if (this.newEmployeeIds.includes(id)) {
        return;
      }

      if (this.newEmployeeIds.length >= this.remainingSlots) {
        (event.target as HTMLInputElement).checked = false;
        return;
      }

      this.newEmployeeIds = [...this.newEmployeeIds, id];
    } else {
      this.newEmployeeIds =
        this.newEmployeeIds.filter(item => item !== id);
    }
  }

  isNewEmployeeSelected(employeeId: number): boolean {
    return this.newEmployeeIds.includes(Number(employeeId));
  }

  saveDates(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.allocations.length === 0) {
      this.errorMessage = 'There are no allocations to update.';
      return;
    }

    for (const allocation of this.allocations) {
      if (
        !allocation.start_date ||
        !allocation.end_date ||
        allocation.start_date > allocation.end_date
      ) {
        this.errorMessage =
          'Each allocation must have valid dates, and end date must be on or after start date.';
        return;
      }
    }

    this.loading = true;

    const payload = this.allocations.map(a => ({
      id: Number(a.id),
      start_date: a.start_date,
      end_date: a.end_date
    }));

    this.service.updateProjectAllocations(
      this.projectId,
      payload
    ).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          this.successMessage = res.message || 'Dates updated successfully.';
          this.loadData();
        } else {
          this.errorMessage = res?.message || 'Unable to update dates.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Unable to update allocation dates.';
      }
    });
  }

  releaseSelected(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.releaseIds.length === 0) {
      this.errorMessage = 'Select at least one allocated employee to release.';
      return;
    }

    if (!confirm(`Release ${this.releaseIds.length} selected allocation(s)?`)) {
      return;
    }

    this.loading = true;

    this.service.releaseProjectAllocations(
      this.projectId,
      this.releaseIds
    ).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.success) {
          this.successMessage = res.message || 'Employees released successfully.';
          this.releaseIds = [];
          this.loadData();
        } else {
          this.errorMessage = res?.message || 'Unable to release employees.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Unable to release employees.';
      }
    });
  }

  addSelectedEmployees(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.newEmployeeIds.length === 0) {
      this.errorMessage = 'Select at least one approved employee to add.';
      return;
    }

    if (this.newEmployeeIds.length > this.remainingSlots) {
      this.errorMessage =
        `You can add only ${this.remainingSlots} more employee(s).`;
      return;
    }

    if (!this.newStartDate || !this.newEndDate) {
      this.errorMessage = 'Enter the start and end dates for new employees.';
      return;
    }

    if (this.newStartDate > this.newEndDate) {
      this.errorMessage = 'End date must be on or after start date.';
      return;
    }

    this.loading = true;

    this.service.createBulkAllocations({
      project_id: this.projectId,
      employee_ids: this.newEmployeeIds,
      start_date: this.newStartDate,
      end_date: this.newEndDate
    }).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (res?.success) {
          this.successMessage = res.message || 'Employees added successfully.';
          this.newEmployeeIds = [];
          this.newStartDate = '';
          this.newEndDate = '';
          this.loadData();
        } else {
          this.errorMessage = res?.message || 'Unable to add employees.';
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage =
          err.error?.message || 'Unable to add employees.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/project-allocations']);
  }
}
