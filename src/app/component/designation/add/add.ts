
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-add-designation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class AddDesignationComponent {

  designation = {
    name: '',
    description: ''
  };

  saving = false;
  errorMessage = '';

  constructor(
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  saveDesignation(): void {

    this.errorMessage = '';

    if (!this.designation.name.trim()) {
      this.errorMessage = 'Designation name is required.';
      return;
    }

    this.saving = true;

    this.masterDataService
      .createDesignation(this.designation)
      .subscribe({

        next: () => {
          this.router.navigate(['/dashboard/designations']);
        },

        error: (err: any) => {

          this.saving = false;

          if (err.error?.errors) {
            this.errorMessage =
              Object.values(err.error.errors)
                .flat()
                .join(' ');
          } else {
            this.errorMessage =
              err.error?.message ||
              'Failed to create designation.';
          }
        }
      });
  }
}
