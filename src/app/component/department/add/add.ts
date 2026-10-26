
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class AddDepartmentComponent {

  department = {
    name: '',
    description: ''
  };

  saving = false;
  errorMessage = '';

  constructor(
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  saveDepartment(): void {

    this.errorMessage = '';

    if (!this.department.name.trim()) {
      this.errorMessage = 'Department name is required.';
      return;
    }

    this.saving = true;

    this.masterDataService
      .createDepartment(this.department)
      .subscribe({

        next: () => {
          this.router.navigate(['/dashboard/departments']);
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
              'Failed to create department.';
          }
        }
      });
  }
}
