import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ResourceManagerService } from '../../../services/resource-manager';

@Component({
  selector: 'app-requirement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requirement-list.html',
  styleUrls: ['./requirement-list.css']
})
export class RequirementList implements OnInit {
  requirements: any[] = [];
  searchText = '';
  loading = false;
  errorMessage = '';

  constructor(
    private service: ResourceManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequirements();
  }

  loadRequirements(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getRequirements(this.searchText).subscribe({
      next: (res: any) => {
        this.requirements = Array.isArray(res.data) ? res.data : [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage =
          err.error?.message || 'Failed to load project requirements.';
        this.loading = false;
      }
    });
  }

  search(): void {
    this.loadRequirements();
  }

  openRequirement(id: number): void {
    this.router.navigate([
      '/dashboard/resource-manager/candidate-matching/',
      id
    ]);
  }
}