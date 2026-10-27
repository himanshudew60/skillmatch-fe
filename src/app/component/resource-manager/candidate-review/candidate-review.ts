
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceManagerService } from '../../../services/resource-manager';

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

  loading = true;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  form = {
    skill_id: null as number | null,
    required_proficiency: null as number | null,
    feedback: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resourceManagerService: ResourceManagerService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state ?? history.state;

    this.candidate = state['candidate'] ?? null;
    this.requirement = state['requirement'] ?? null;

    this.route.queryParamMap.subscribe(params => {
      const requirementId = Number(params.get('requirementId'));

      if (!this.requirement && requirementId) {
        this.requirement = { id: requirementId };
      }
    });

    this.loading = false;

    if (!this.candidate || !this.requirement?.id) {
      this.errorMessage =
        'Candidate details are missing. Return to candidate matching and open the upskill request again.';
      return;
    }

    const firstSkill = this.candidate.skills?.[0];

    if (firstSkill) {
      this.form.skill_id = Number(firstSkill.skill_id);
      this.form.required_proficiency =
        Number(firstSkill.required_proficiency);
    }
  }

  onSkillChange(): void {
    const selectedSkill = this.candidate?.skills?.find(
      (skill: any) => Number(skill.skill_id) === Number(this.form.skill_id)
    );

    if (selectedSkill) {
      this.form.required_proficiency =
        Number(selectedSkill.required_proficiency);
    }
  }

  back(): void {
    if (this.requirement?.id) {
      this.router.navigate([
        '/resource-manager/requirements',
        this.requirement.id,
        'matching'
      ]);
    } else {
      this.router.navigate(['/resource-manager/requirements']);
    }
  }

  submitRequest(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.candidate ||
      !this.requirement?.id ||
      !this.form.skill_id ||
      !this.form.required_proficiency ||
      !this.form.feedback.trim()
    ) {
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.submitting = true;

    const payload = {
      employee_id: Number(this.candidate.employee.id),
      project_requirement_id: Number(this.requirement.id),
      skill_id: Number(this.form.skill_id),
      required_proficiency: Number(this.form.required_proficiency),
      feedback: this.form.feedback.trim()
    };

    this.resourceManagerService.sendUpskillRequest(payload).subscribe({
      next: (response: any) => {
        this.successMessage =
          response?.message ?? 'Upskill request sent to L&K successfully.';
        this.submitting = false;

        // Return to matching after a short confirmation period
        // by using a button in the template.
      },
      error: (error: any) => {
        console.error('Unable to send upskill request:', error);
        this.errorMessage =
          error?.error?.message ?? 'Unable to send the request to L&K.';
        this.submitting = false;
      }
    });
  }

  returnToMatching(): void {
    this.back();
  }
  toNumber(value: any): number {
  return Number(value);
}
}
