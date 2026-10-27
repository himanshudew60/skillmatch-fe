
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceManagerService } from '../../../services/resource-manager';

interface ProjectSkill {
  skill_id: number;
  skill_name: string;
  skill_type: string;
  required_proficiency: number | null;
}

interface UpskillFormItem {
  skill_id: number;
  required_proficiency: number | null;
  feedback: string;
}

@Component({
  selector: 'app-candidate-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidate-review.html',
  styleUrl: './candidate-review.css'
})
export class CandidateReview implements OnInit {
  candidate: any = null;
  requirement: any = null;
  aiRecommendation: any = null;

  requirementId: number | null = null;
  employeeId: number | null = null;

  projectSkills: ProjectSkill[] = [];
  upskillOptions: ProjectSkill[] = [];
  selectedSkills: UpskillFormItem[] = [];

  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';
  action = 'upskill';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resourceManagerService: ResourceManagerService
  ) {}

  ngOnInit(): void {
    const state = history.state ?? {};

    this.candidate = state.candidate ?? null;
    this.requirement = state.requirement ?? null;
    this.aiRecommendation = state.aiRecommendation ?? null;

    this.route.paramMap.subscribe(params => {
      this.employeeId = Number(params.get('id')) || null;
      this.resolvePageData();
    });

    this.route.queryParamMap.subscribe(params => {
      this.requirementId =
        Number(params.get('requirementId')) || null;

      this.action = params.get('action') || 'upskill';
      this.resolvePageData();
    });
  }

  private resolvePageData(): void {
    if (!this.employeeId && this.candidate) {
      this.employeeId = Number(
        this.candidate.employee_id ?? this.candidate.id
      ) || null;
    }

    if (!this.requirementId && this.requirement) {
      this.requirementId = Number(
        this.requirement.requirement_id ??
        this.requirement.id
      ) || null;
    }

    if (this.requirement && this.requirementId) {
      this.requirement = {
        ...this.requirement,
        requirement_id:
          this.requirement.requirement_id ?? this.requirementId
      };
    }

    if (!this.candidate || !this.requirementId) {
      this.loading = false;
      this.errorMessage = !this.candidate
        ? 'Employee details are missing. Return to candidate matching and reopen the employee.'
        : 'Project requirement ID is missing. Return to candidate matching and reopen the employee.';
      return;
    }

    this.projectSkills = this.normalizeProjectSkills(
      this.requirement?.required_skills ??
      this.requirement?.requiredSkills ??
      []
    );

    this.buildUpskillOptions();
    this.loading = false;
  }

  private normalizeProjectSkills(skills: any[]): ProjectSkill[] {
    if (!Array.isArray(skills)) {
      return [];
    }

    return skills
      .filter((skill: any) => skill?.skill_id != null)
      .map((skill: any) => ({
        skill_id: Number(skill.skill_id),
        skill_name: skill.skill_name ?? 'Unnamed skill',
        skill_type: skill.skill_type ?? 'Additional',
        required_proficiency:
          skill.required_proficiency != null
            ? Number(skill.required_proficiency)
            : null
      }));
  }

  private buildUpskillOptions(): void {
    this.upskillOptions = this.projectSkills.filter(skill => {
      const status = this.getSkillStatus(skill);

      return status === 'Missing skill' ||
        status === 'Below required level' ||
        status === 'L&K assessment unavailable';
    });

    // Do not automatically select skills or send a request.
    this.selectedSkills = [];
  }

  getEmployeeSkill(projectSkill: ProjectSkill): any | null {
    return (this.candidate?.skills ?? []).find(
      (skill: any) =>
        Number(skill.skill_id) === Number(projectSkill.skill_id)
    ) ?? null;
  }

  getSkillStatus(skill: ProjectSkill): string {
    const employeeSkill = this.getEmployeeSkill(skill);

    if (!employeeSkill) {
      return 'Missing skill';
    }

    const assessment = employeeSkill.lk_assessment;

    if (
      !assessment ||
      String(assessment.decision ?? '').trim().toLowerCase() !== 'approved'
    ) {
      return 'L&K assessment unavailable';
    }

    if (
      skill.required_proficiency != null &&
      (
        assessment.lk_proficiency == null ||
        Number(assessment.lk_proficiency) <
          skill.required_proficiency
      )
    ) {
      return 'Below required level';
    }

    return 'Requirement met';
  }

  getSkillStatusClass(skill: ProjectSkill): string {
    switch (this.getSkillStatus(skill)) {
      case 'Requirement met':
        return 'gap-met';
      case 'Missing skill':
        return 'gap-missing';
      case 'Below required level':
        return 'gap-below';
      default:
        return 'gap-unknown';
    }
  }

  getGap(skill: ProjectSkill): string {
    const employeeSkill = this.getEmployeeSkill(skill);

    if (!employeeSkill) {
      return 'Skill missing';
    }

    const current = employeeSkill.lk_assessment?.lk_proficiency;
    const target = skill.required_proficiency;

    if (
      current == null ||
      String(employeeSkill.lk_assessment?.decision ?? '')
        .trim().toLowerCase() !== 'approved'
    ) {
      return 'L&K verification needed';
    }

    if (target == null) {
      return 'Target not specified';
    }

    const difference = target - Number(current);

    return difference > 0
      ? `${difference} level(s) below`
      : 'No gap';
  }

  isSelected(skillId: number): boolean {
    return this.selectedSkills.some(
      item => item.skill_id === Number(skillId)
    );
  }

  getFormSkill(skillId: number): UpskillFormItem | undefined {
    return this.selectedSkills.find(
      item => item.skill_id === Number(skillId)
    );
  }

  toggleSkill(skill: ProjectSkill, checked: boolean): void {
    const skillId = Number(skill.skill_id);

    if (!checked) {
      this.selectedSkills = this.selectedSkills.filter(
        item => item.skill_id !== skillId
      );
      return;
    }

    if (this.isSelected(skillId)) {
      return;
    }

    this.selectedSkills = [
      ...this.selectedSkills,
      {
        skill_id: skillId,
        required_proficiency: skill.required_proficiency,
        feedback: this.getDefaultFeedback(skill)
      }
    ];
  }

  updateTarget(skillId: number, value: number | null): void {
    const item = this.getFormSkill(skillId);

    if (item) {
      item.required_proficiency =
        value == null ? null : Number(value);
    }
  }

  updateFeedback(skillId: number, value: string): void {
    const item = this.getFormSkill(skillId);

    if (item) {
      item.feedback = value;
    }
  }

  private getDefaultFeedback(skill: ProjectSkill): string {
    const employeeSkill = this.getEmployeeSkill(skill);
    const current = employeeSkill?.lk_assessment?.lk_proficiency;

    if (!employeeSkill) {
      return `Project requires ${skill.skill_name} at proficiency ${
        skill.required_proficiency ?? 'not specified'
      }. This skill is not recorded for the employee. Please assess and upskill as needed.`;
    }

    return `Project requires ${skill.skill_name} at proficiency ${
      skill.required_proficiency ?? 'not specified'
    }. Current L&K proficiency: ${
      current ?? 'not verified'
    }. Please review the gap and recommend appropriate upskilling.`;
  }

  submitRequest(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const employeeId = Number(
      this.candidate?.employee_id ?? this.candidate?.id
    );

    if (!employeeId || !this.requirementId) {
      this.errorMessage = 'Employee or project requirement ID is missing.';
      return;
    }

    if (this.selectedSkills.length === 0) {
      this.errorMessage = 'Select at least one skill to submit.';
      return;
    }

    const invalidItem = this.selectedSkills.find(item =>
      !item.skill_id ||
      item.required_proficiency == null ||
      item.required_proficiency < 1 ||
      item.required_proficiency > 5 ||
      !item.feedback.trim() ||
      item.feedback.trim().length < 5
    );

    if (invalidItem) {
      this.errorMessage =
        'Provide a valid target proficiency and feedback of at least 5 characters for every selected skill.';
      return;
    }

    const selectedSkillIds = this.selectedSkills.map(
      item => Number(item.skill_id)
    );

    if (new Set(selectedSkillIds).size !== selectedSkillIds.length) {
      this.errorMessage = 'A skill cannot be selected more than once.';
      return;
    }

    this.submitting = true;

    const payload = {
      employee_id: employeeId,
      project_requirement_id: this.requirementId,
      skills: this.selectedSkills.map(item => ({
        skill_id: Number(item.skill_id),
        required_proficiency: Number(item.required_proficiency),
        feedback: item.feedback.trim()
      }))
    };

    this.resourceManagerService.sendUpskillRequest(payload).subscribe({
      next: (response: any) => {
        this.successMessage =
          response?.message ??
          'Selected skill upskill requests were submitted successfully.';
        this.submitting = false;
      },
      error: (error: any) => {
        console.error('Unable to submit upskill requests:', error);

        this.errorMessage =
          error?.error?.message ??
          'Unable to submit the skill requests. Please try again.';
        this.submitting = false;
      }
    });
  }

  back(): void {
    this.returnToMatching();
  }

  returnToMatching(): void {
    if (this.requirementId) {
      this.router.navigate([
        '/dashboard/resource-manager/candidate-matching',
        this.requirementId
      ]);
    } else {
      this.router.navigate(['/dashboard/resource-manager']);
    }
  }
}
