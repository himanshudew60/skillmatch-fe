import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceManagerService } from '../../../services/resource-manager';

@Component({
  selector: 'app-requirement-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requirement-details.html',
  styleUrls: ['./requirement-details.css']
})
export class RequirementDetails implements OnInit {
  requirement: any = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResourceManagerService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || !Number.isInteger(id)) {
      this.errorMessage = 'Invalid requirement ID.';
      return;
    }

    this.loading = true;

    this.service.getRequirement(id).subscribe({
      next: (res: any) => {
        this.requirement = res.data || res.requirement || res;
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load requirement.';
        this.loading = false;
      }
    });
  }

  findCandidates(): void {
    this.router.navigate([
      '/dashboard/resource-manager/candidate-matching',
      this.requirement.id,
    ]);
  }

  back(): void {
    this.router.navigate(['/dashboard/resource-manager/requirements']);
  }
}