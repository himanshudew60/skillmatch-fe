
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-designation-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './designation-list.html',
  styleUrl: './designation-list.css'
})
export class DesignationListComponent implements OnInit {

  designations: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadDesignations();
  }

  loadDesignations(): void {

    this.loading = true;

    this.masterDataService.getDesignations().subscribe({

      next: (res: any) => {
        this.designations = res.data ?? [];
        this.loading = false;
      },

      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load designations.';
        this.loading = false;
      }
    });
  }

  deleteDesignation(id: number): void {

    if (!confirm('Are you sure you want to delete this designation?')) {
      return;
    }

    this.masterDataService.deleteDesignation(id).subscribe({

      next: (res: any) => {
        this.successMessage =
          res.message || 'Designation deleted successfully.';
        this.loadDesignations();
      },

      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to delete designation.';
      }
    });
  }
}
