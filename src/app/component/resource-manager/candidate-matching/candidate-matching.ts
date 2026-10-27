
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
    this.loading = true;
    this.errorMessage = '';
    this.aiError = '';
    this.selectedRecommendation = null;

    forkJoin({
      employeesResponse: this.service.getRecommendations(this.requirementId),
      aiResponse: this.service.getAiRecommendations(this.requirementId)
    }).subscribe({
      next: ({ employeesResponse, aiResponse }: any) => {
        if (
          employeesResponse?.success === false ||
          aiResponse?.success === false
        ) {
          this.errorMessage =
            aiResponse?.message ||
            employeesResponse?.message ||
            'Unable to load employee recommendations.';
          this.loading = false;
          return;
        }

        // Use the project and skills returned by the Laravel API.
        this.project = aiResponse?.project ?? null;

        this.requiredSkills =
          aiResponse?.required_skills ??
          aiResponse?.project?.required_skills ??
          [];

        // The employee endpoint returns L&K-eligible employees.
        this.candidates = employeesResponse?.employees ?? [];

        const employeesById = new Map<number, any>(
          this.candidates.map((employee: any) => [
            Number(employee.employee_id),
            employee
          ])
        );

        const aiData = aiResponse?.ai;
        this.aiSummary =
          typeof aiData?.summary === 'string' ? aiData.summary : '';

        this.aiError = aiData?.error ?? '';

        const recommendations = Array.isArray(aiData)
          ? aiData
          : Array.isArray(aiData?.recommendations)
            ? aiData.recommendations
            : [];

        this.aiRecommendations = recommendations
          .map((item: any, index: number) => {
            const employeeId = Number(
              item.employee_id ??
              item.employee?.employee_id ??
              item.employee?.id
            );

            const employee =
              item.employee ??
              employeesById.get(employeeId);

            return {
              ...item,
              employee_id: employeeId,
              rank: item.rank ?? index + 1,
              employee,
              // Keep per-candidate required-skill analysis if supplied
              // by the backend recommendation service.
              required_skill_matches:
                item.required_skill_matches ?? []
            };
          })
          .filter((item: any) => !!item.employee)
          .sort(
            (a: any, b: any) => Number(a.rank) - Number(b.rank)
          );

        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err?.error?.message ||
          'Failed to load recommendations. Please try again.';
        this.loading = false;
      }
    });
  }

  get filteredRecommendations(): any[] {
    const term = this.searchTerm.trim().toLowerCase();

    const filtered = this.aiRecommendations.filter((item: any) => {
      const employee = item.employee;

      const employeeSkills = (employee?.skills ?? [])
        .map((skill: any) => skill.skill_name);

      const requiredSkillNames = this.requiredSkills
        .map((skill: any) => skill.skill_name);

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

      return (
        Number(b.overall_match_percentage ?? 0) -
        Number(a.overall_match_percentage ?? 0)
      );
    });
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

  viewAnalysis(item: any): void {
    this.selectedRecommendation =
      this.selectedRecommendation?.employee_id === item.employee_id
        ? null
        : item;
  }

  /**
   * Find the employee's skill corresponding to a project-required skill.
   * Skill IDs are compared, not names, to avoid false matches.
   */
  getEmployeeSkill(employee: any, requiredSkill: any): any | null {
    return (employee?.skills ?? []).find(
      (skill: any) =>
        Number(skill.skill_id) === Number(requiredSkill.skill_id)
    ) ?? null;
  }

  /**
   * Explain the employee's status for each required project skill.
   * The employee must have the required skill and sufficient L&K
   * proficiency to satisfy the requirement.
   */
  getRequiredSkillStatus(employee: any, requiredSkill: any): string {
    const employeeSkill = this.getEmployeeSkill(employee, requiredSkill);

    if (!employeeSkill) {
      return 'Missing required skill';
    }

    const assessment = employeeSkill.lk_assessment;

    if (
      !assessment ||
      String(assessment.decision ?? '').trim().toLowerCase() !== 'approved'
    ) {
      return 'L&K evidence unavailable';
    }

    if (
      requiredSkill.required_proficiency != null &&
      (
        assessment.lk_proficiency == null ||
        Number(assessment.lk_proficiency) <
          Number(requiredSkill.required_proficiency)
      )
    ) {
      return 'Below required proficiency';
    }

    return 'Requirement met';
  }

  getRequiredSkillStatusClass(employee: any, requiredSkill: any): string {
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

  getMatchedRequiredSkillCount(employee: any): number {
    return this.requiredSkills.filter(
      (skill: any) =>
        this.getRequiredSkillStatus(employee, skill) === 'Requirement met'
    ).length;
  }

  getEmployeeSkillCount(employee: any): number {
    return (employee?.skills ?? []).length;
  }

  requestUpskill(item: any): void {
    const employee = item.employee ?? item;
    const employeeId = Number(employee.employee_id ?? employee.id);

    if (!employeeId || !this.requirementId) {
      console.error('Missing employee or requirement ID', item);
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

  reviewVerify(item: any): void {
    alert(item.employee)
  }

  back(): void {
    this.router.navigate(['/dashboard/resource-manager']);
  }
}
