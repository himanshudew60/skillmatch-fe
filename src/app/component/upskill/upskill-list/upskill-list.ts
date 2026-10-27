import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LkService } from '../../../services/lk';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upskill-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './upskill-list.html',
  styleUrls: ['./upskill-list.css']
})
export class UpskillList implements OnInit {
  requests: any[] = [];
  loading = false;
  errorMessage = '';
  searchText = '';

  constructor(
    private lkService: LkService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.errorMessage = '';

    this.lkService.getUpskillRequests().subscribe({
      next: (res: any) => {
        this.requests = res.data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load upskill requests:', err);
        this.errorMessage =
          err.error?.message || 'Failed to load upskill requests.';
        this.loading = false;
      }
    });
  }

  get filteredRequests(): any[] {
    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.requests;
    }

    return this.requests.filter(request =>
      [
        request.emp_code,
        request.emp_name,
        request.skill_name,
        request.project_name,
        request.status
      ].some(value =>
        String(value || '').toLowerCase().includes(search)
      )
    );
  }

  openAssessment(id: number): void {
    this.router.navigate(['/dashboard/upskill/assessment', id]);
  }
}