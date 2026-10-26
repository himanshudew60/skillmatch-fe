
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectRequirementService } from '../../../services/project-requirement';

@Component({
  selector: 'app-view-project-requirement',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view.html',
  styleUrl: './view.css'
})
export class ViewProjectRequirementComponent implements OnInit {

  requirementId!: number;

  requirement: any = null;

  loading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private requirementService: ProjectRequirementService
  ) {}

  ngOnInit(): void {
    this.requirementId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.requirementId) {
      this.errorMessage = 'Invalid requirement ID.';
      this.loading = false;
      return;
    }

    this.loadRequirement();
  }

  loadRequirement(): void {
    this.requirementService.getRequirement(this.requirementId).subscribe({
      next: (res: any) => {
        this.requirement = res.data;
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load requirement.';
        this.loading = false;
      }
    });
  }
}
