import { Component, OnInit } from '@angular/core';
import { Employee } from '../../../services/employee';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employees',
  imports: [CommonModule, RouterLink],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees implements OnInit {

  employees: any[] = [];

  loading = false;
  importing = false;

  selectedFile: File | null = null;

  showImportModal = false;

  constructor(private employeeService: Employee) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {

    this.loading = true;

    this.employeeService.getEmployees().subscribe({

      next: (res: any) => {

        this.employees = res.data || [];

        this.loading = false;

      },

      error: (err) => {

        console.error('Employee list error:', err);

        this.loading = false;

        alert(
          err.error?.message ||
          'Failed to load employees.'
        );
      }

    });
  }

  openImportModal(): void {

    this.selectedFile = null;
    this.showImportModal = true;

  }

  closeImportModal(): void {

    this.showImportModal = false;
    this.selectedFile = null;

  }

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile = input.files[0];

  }

  importEmployees(): void {

    if (!this.selectedFile) {

      alert('Please select an Excel file.');

      return;
    }

    const allowedExtensions = [
      '.xlsx',
      '.xls',
      '.csv'
    ];

    const fileName = this.selectedFile.name.toLowerCase();

    const validFile = allowedExtensions.some(
      extension => fileName.endsWith(extension)
    );

    if (!validFile) {

      alert('Please select an Excel or CSV file.');

      return;
    }

    this.importing = true;

    this.employeeService
      .importEmployees(this.selectedFile)
      .subscribe({

        next: (res: any) => {

          this.importing = false;

          alert(
            res.message ||
            'Employees imported successfully.'
          );

          this.closeImportModal();

          this.loadEmployees();

        },

        error: (err) => {

          console.error('Import error:', err);

          this.importing = false;

          alert(
            err.error?.message ||
            'Failed to import employees.'
          );

        }

      });
  }
  deleleEmployee(empid:any){
    this.employeeService.deleteEmployee(empid).subscribe((res:any)=>{
      this.loadEmployees()
    })
  }
}