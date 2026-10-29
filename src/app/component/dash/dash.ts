import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface DashboardSummary {
  total_employees: number;
  allocated_employees: number;
  available_employees: number;
  partially_available_employees: number;
  resource_status_allocated: number;
  total_departments: number;
  total_projects: number;
  total_skills: number;
  employees_requiring_upskill: number;
  upskill_assessment_count: number;
  pending_assessments: number;
  approved_assessments: number;
}

interface DepartmentAnalytics {
  department_id: number;
  department_name: string;
  total_employees: number;
  available_employees: number;
  allocated_employees: number;
  partially_available_employees: number;
}

interface RecentAssessment {
  id: number;
  employee_id: number;
  emp_name: string;
  emp_code: string;
  skill_name: string;
  employee_proficiency: number | null;
  lk_proficiency: number | null;
  decision: string;
  assessed_at: string | null;
  created_at: string;
}

interface UpskillSkill {
  skill_id: number;
  skill_name: string;
  assessment_count: number;
  employee_count: number;
}

interface DashboardResponse {
  success: boolean;
  message?: string;
  data: {
    summary: DashboardSummary;
    departments: DepartmentAnalytics[];
    recent_assessments: RecentAssessment[];
    upskill_skills: UpskillSkill[];
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dash.html',
  styleUrl: './dash.css'
})
export class DashboardInfo implements OnInit {
  private readonly apiUrl = 'http://127.0.0.1:8000/api/dashboard';

  loading = true;
  errorMessage = '';

  summary: DashboardSummary | null = null;
  departments: DepartmentAnalytics[] = [];
  recentAssessments: RecentAssessment[] = [];
  upskillSkills: UpskillSkill[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      Accept: 'application/json',
      Authorization: `Bearer ${token ?? ''}`
    });

    this.http.get<DashboardResponse>(this.apiUrl, { headers }).subscribe({
      next: (response) => {
        console.log(response);
        
        if (!response?.success || !response.data) {
          this.errorMessage =
            response?.message || 'Unable to load dashboard analytics.';
          this.loading = false;
          return;
        }

        this.summary = response.data.summary;
        this.departments = response.data.departments ?? [];
        this.recentAssessments =
          response.data.recent_assessments ?? [];
        this.upskillSkills = response.data.upskill_skills ?? [];

        this.loading = false;
      },
      error: (error) => {
        console.error('Dashboard analytics error:', error);

        this.errorMessage =
          error?.status === 401 || error?.status === 403
            ? 'Your session may have expired. Please sign in again.'
            : error?.error?.message ||
              'Unable to load dashboard analytics. Please try again.';

        this.loading = false;
      }
    });
  }

  get allocationRate(): number {
    if (!this.summary || this.summary.total_employees === 0) {
      return 0;
    }

    return Math.round(
      (this.summary.allocated_employees /
        this.summary.total_employees) * 100
    );
  }

  getResourcePercentage(count: number): number {
    const total = Number(this.summary?.total_employees ?? 0);

    if (total <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((count / total) * 100));
  }

  getDepartmentPercentage(count: number, total: number): number {
    if (total <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((count / total) * 100));
  }

  formatDecision(decision: string): string {
    return decision || 'Not assessed';
  }

  formatDate(date: string | null): string {
    if (!date) {
      return 'Not yet assessed';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  trackByDepartment(
    _index: number,
    department: DepartmentAnalytics
  ): number {
    return department.department_id;
  }

  trackByAssessment(
    _index: number,
    assessment: RecentAssessment
  ): number {
    return assessment.id;
  }
}