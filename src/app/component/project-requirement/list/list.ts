
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectRequirementService } from '../../../services/project-requirement';

@Component({
  selector: 'app-project-requirement-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class ProjectRequirementListComponent implements OnInit {

  requirements: any[] = [];

  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private requirementService: ProjectRequirementService
  ) {}

  ngOnInit(): void {
    this.loadRequirements();
  }

  loadRequirements(): void {
    this.loading = true;
    this.errorMessage = '';

    this.requirementService.getRequirements().subscribe({
      next: (res: any) => {
        this.requirements = res.data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load project requirements.';
        this.loading = false;
      }
    });
  }

  deleteRequirement(id: number): void {
    if (!confirm('Are you sure you want to delete this requirement?')) {
      return;
    }

    this.requirementService.deleteRequirement(id).subscribe({
      next: (res: any) => {
        this.successMessage =
          res.message || 'Requirement deleted successfully.';

        this.loadRequirements();
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to delete requirement.';
      }
    });
  }
}
