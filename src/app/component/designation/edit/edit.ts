
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-edit-designation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class EditDesignationComponent implements OnInit {

  designationId!: number;

  designation = {
    name: '',
    description: ''
  };

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.designationId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.designationId) {
      this.errorMessage = 'Invalid designation ID.';
      this.loading = false;
      return;
    }

    this.loadDesignation();
  }

  loadDesignation(): void {

    this.loading = true;
    this.errorMessage = '';

    this.masterDataService
      .getDesignation(this.designationId)
      .subscribe({

        next: (res: any) => {

          const data = res.data;

          this.designation = {
            name: data?.name || '',
            description: data?.description || ''
          };

          this.loading = false;
        },

        error: (err: any) => {

          this.errorMessage =
            err.error?.message ||
            'Failed to load designation.';

          this.loading = false;
        }
      });
  }

  updateDesignation(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const name = this.designation.name.trim();

    if (!name) {
      this.errorMessage = 'Designation name is required.';
      return;
    }

    this.saving = true;

    const payload = {
      name: name,
      description: this.designation.description?.trim() || ''
    };

    this.masterDataService
      .updateDesignation(this.designationId, payload)
      .subscribe({

        next: (res: any) => {

          this.saving = false;

          this.successMessage =
            res.message ||
            'Designation updated successfully.';

          setTimeout(() => {

            this.router.navigate([
              '/dashboard/designations'
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
              'Failed to update designation.';
          }
        }
      });
  }
}
