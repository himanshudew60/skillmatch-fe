
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceManagerService } from '../../../services/resource-manager';

@Component({
  selector: 'app-candidate-matching',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-matching.html',
  styleUrls: ['./candidate-matching.css']
})
export class CandidateMatching implements OnInit {
  requirementId!: number;

  candidates: any[] = [];
  aiRecommendations: any[] = [];
  requiredSkills: any[] = [];

  project: any = null;
  aiSummary = '';

  searchTerm = '';
  sortBy = 'match';
  selectedRecommendation: any = null;

  loading = false;
  errorMessage = '';
  aiError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResourceManagerService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid project requirement ID.';
      return;
    }

    this.requirementId = id;
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    if (!this.requirementId) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.aiError = '';
    this.selectedRecommendation = null;

    this.service.getAiRecommendations(this.requirementId).subscribe({
      next: (response: any) => {
        if (!response?.success) {
          this.errorMessage =
            response?.message || 'Unable to generate recommendations.';
          this.loading = false;
          return;
        }

        this.project = response.project ?? null;

        this.requiredSkills = Array.isArray(response.required_skills)
          ? response.required_skills
          : [];

        this.candidates = Array.isArray(response.eligible_employees)
          ? response.eligible_employees
          : [];

        const aiData = response.ai ?? {};

        this.aiSummary = aiData.summary ?? '';
        this.aiError = aiData.error ?? '';

        const employeesById = new Map<number, any>(
          this.candidates.map((employee: any) => [
            Number(employee.employee_id ?? employee.id),
            employee
          ])
        );

        const recommendations = Array.isArray(aiData.recommendations)
          ? aiData.recommendations
          : [];

        this.aiRecommendations = recommendations
          .map((item: any, index: number) => {
            const employeeId = Number(item.employee_id);

            return {
              ...item,
              employee_id: employeeId,
              rank: item.rank ?? index + 1,
              employee: employeesById.get(employeeId)
            };
          })
          .filter((item: any) => !!item.employee)
          .sort(
            (a: any, b: any) =>
              this.getMatchPercentage(b) - this.getMatchPercentage(a)
          );

        this.loading = false;
      },

      error: (err: any) => {
        this.errorMessage =
          err?.error?.message ||
          'Failed to generate recommendations. Please try again.';

        this.loading = false;
      }
    });
  }

  // Search and sorting

  get filteredRecommendations(): any[] {
    const term = this.searchTerm.trim().toLowerCase();

    const filtered = this.aiRecommendations.filter((item: any) => {
      const employee = item.employee;

      const employeeSkills = (employee?.skills ?? []).map(
        (skill: any) => skill.skill_name
      );

      const requiredSkillNames = this.requiredSkills.map(
        (skill: any) => skill.skill_name
      );

      const searchable = [
        employee?.emp_name,
        employee?.emp_code,
        employee?.designation_name,
        employee?.department_name,
        ...employeeSkills,
        ...requiredSkillNames
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(term);
    });

    return [...filtered].sort((a: any, b: any) => {
      if (this.sortBy === 'name') {
        return (a.employee?.emp_name ?? '').localeCompare(
          b.employee?.emp_name ?? ''
        );
      }

      if (this.sortBy === 'rating') {
        return this.ratingValue(b.rating) - this.ratingValue(a.rating);
      }

      return this.getMatchPercentage(b) - this.getMatchPercentage(a);
    });
  }

  getMatchPercentage(item: any): number {
    const value = Number(item?.overall_match_percentage ?? 0);

    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(100, value));
  }

  private ratingValue(rating: string): number {
    const values: Record<string, number> = {
      'Excellent Match': 4,
      'Strong Match': 3,
      'Partial Match': 2,
      'Low Match': 1
    };

    return values[rating] ?? 0;
  }

  // Expand and collapse employee details

  viewAnalysis(item: any): void {
    this.selectedRecommendation =
      this.selectedRecommendation?.employee_id === item.employee_id
        ? null
        : item;
  }

  // Employee skill lookup by ID

  getEmployeeSkill(employee: any, requiredSkill: any): any | null {
    return (employee?.skills ?? []).find(
      (skill: any) =>
        Number(skill.skill_id) === Number(requiredSkill.skill_id)
    ) ?? null;
  }

  getEmployeeSkillCount(employee: any): number {
    return Array.isArray(employee?.skills) ? employee.skills.length : 0;
  }

  getMatchedRequiredSkillCount(employee: any): number {
    return this.requiredSkills.filter(
      (skill: any) =>
        this.getRequiredSkillStatus(employee, skill) === 'Requirement met'
    ).length;
  }

  getRequirementsMetCount(): number {
    if (this.requiredSkills.length === 0) {
      return 0;
    }

    return this.aiRecommendations.filter(
      (item: any) =>
        this.getEmployeeStatus(item.employee) === 'Meets requirements'
    ).length;
  }

  // Project skill compliance

  getRequiredSkillStatus(employee: any, requiredSkill: any): string {
    const employeeSkill = this.getEmployeeSkill(employee, requiredSkill);

    if (!employeeSkill) {
      return 'Missing required skill';
    }

    const target = requiredSkill.required_proficiency;
    const assessment = employeeSkill.lk_assessment;

    // Check recorded employee proficiency.
    if (
      target != null &&
      Number(employeeSkill.employee_proficiency ?? 0) < Number(target)
    ) {
      return 'Below required proficiency';
    }

    // Require an approved L&K assessment.
    if (
      !assessment ||
      String(assessment.decision ?? '').trim().toLowerCase() !== 'approved' ||
      assessment.lk_proficiency == null
    ) {
      return 'L&K review needed';
    }

    // Check assessed proficiency against the project target.
    if (
      target != null &&
      Number(assessment.lk_proficiency) < Number(target)
    ) {
      return 'Below required proficiency';
    }

    return 'Requirement met';
  }

  getRequiredSkillStatusClass(
    employee: any,
    requiredSkill: any
  ): string {
    const status = this.getRequiredSkillStatus(employee, requiredSkill);

    switch (status) {
      case 'Requirement met':
        return 'skill-status-met';

      case 'Missing required skill':
        return 'skill-status-missing';

      case 'Below required proficiency':
        return 'skill-status-below';

      default:
        return 'skill-status-unknown';
    }
  }

  needsUpskill(employee: any): boolean {
    return this.requiredSkills.some((skill: any) => {
      const status = this.getRequiredSkillStatus(employee, skill);

      return [
        'Missing required skill',
        'Below required proficiency'
      ].includes(status);
    });
  }

  getEmployeeStatus(employee: any): string {
    // Do not automatically mark employees as qualified when
    // the API has supplied no project skill requirements.
    if (!this.requiredSkills.length) {
      return 'L&K review needed';
    }

    const statuses = this.requiredSkills.map((skill: any) =>
      this.getRequiredSkillStatus(employee, skill)
    );

    if (
      statuses.some(status =>
        [
          'Missing required skill',
          'Below required proficiency'
        ].includes(status)
      )
    ) {
      return 'Upskill recommended';
    }

    if (statuses.some(status => status !== 'Requirement met')) {
      return 'L&K review needed';
    }

    return 'Meets requirements';
  }

  getEmployeeStatusClass(employee: any): string {
    const status = this.getEmployeeStatus(employee);

    switch (status) {
      case 'Meets requirements':
        return 'status-ready';

      case 'Upskill recommended':
        return 'status-upskill';

      default:
        return 'status-review';
    }
  }

  // Navigate to the candidate review / upskilling workflow

  requestUpskill(item: any): void {
    const employee = item.employee ?? item;

    const employeeId = Number(
      employee.employee_id ?? employee.id
    );

    if (!employeeId || !this.requirementId) {
      alert('Employee or requirement ID is missing.');
      return;
    }

    this.router.navigate(
      ['/dashboard/resource-manager/candidate-review', employeeId],
      {
        state: {
          candidate: employee,
          aiRecommendation: item.employee ? item : null,
          requirement: this.project
            ? {
                ...this.project,
                id: this.project.requirement_id ?? this.requirementId
              }
            : { id: this.requirementId }
        },
        queryParams: {
          requirementId: this.requirementId,
          action: 'upskill'
        }
      }
    );
  }

  // Verify the employee using your existing backend service

  reviewVerify(item: any): void {
    const employee = item.employee ?? item;

    const employeeId = Number(
      employee.employee_id ?? employee.id
    );

    if (!employeeId) {
      alert('Employee ID not found.');
      return;
    }

    this.service.updateEmployeeStatus(employeeId, 4).subscribe({
      next: (response: any) => {
        if (response?.success) {
          alert(
            'Employee reviewed successfully and moved to Resource Allocator.'
          );

          this.loadRecommendations();
        } else {
          alert(
            response?.message || 'Failed to update employee status.'
          );
        }
      },

      error: (err: any) => {
        alert(
          err?.error?.message ||
          'Failed to update employee status. Please try again.'
        );
      }
    });
  }

  back(): void {
    this.router.navigate(['/dashboard/resource-manager']);
  }
}
