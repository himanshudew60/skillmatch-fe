
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LkService } from '../../../services/lk';

@Component({
  selector: 'app-lk-employee-review',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './lk-employee-review.html',
  styleUrls: ['./lk-employee-review.css']
})
export class LkEmployeeReview implements OnInit {

  employeeId!: number;
  employee: any = null;
  skills: any[] = [];

  reviewForm!: FormGroup;

  loading = false;
  submitting = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lkService: LkService
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      skills: this.fb.array([])
    });

    this.route.paramMap.subscribe(params => {
      // Matches the route /dashboard/lk/review/:employeeId
      const id = Number(params.get('id'));

      if (!id || !Number.isInteger(id)) {
        this.errorMessage = 'Invalid employee ID.';
        return;
      }

      this.employeeId = id;
      this.loadEmployee();
    });
  }

  get skillForms(): FormArray {
    return this.reviewForm.get('skills') as FormArray;
  }

  getSkillForm(index: number): FormGroup {
    return this.skillForms.at(index) as FormGroup;
  }

  loadEmployee(): void {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.lkService.getEmployeeSkills(this.employeeId).subscribe({
      next: (res: any) => {
        this.employee = res.employee || null;
        this.skills = res.skills || [];

        this.buildSkillForms();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load employee review:', err);

        this.errorMessage =
          err.error?.message || 'Failed to load employee details.';

        this.loading = false;
      }
    });
  }

  buildSkillForms(): void {
    this.skillForms.clear();

    this.skills.forEach(skill => {
      const form = this.fb.group({
        employee_skill_id: [skill.employee_skill_id || null],
        skill_id: [skill.skill_id, Validators.required],

        // Required only for an Approved L&K assessment.
        lk_proficiency: [
          null,
          [Validators.min(1), Validators.max(5)]
        ],
        lk_score: [
          null,
          [Validators.min(0), Validators.max(100)]
        ],

        decision: ['Approved', Validators.required],

        // Required only when sending a skill to upskill.
        required_proficiency: [null],
        feedback: ['']
      });

     this.skillForms.push(form);
this.onDecisionChange(this.skillForms.length - 1, 'Approved');
    });
  }

  onDecisionChange(index: number, decision: string): void {
    const form = this.getSkillForm(index);

    const lkProf = form.get('lk_proficiency');
    const lkScore = form.get('lk_score');
    const requiredProf = form.get('required_proficiency');
    const feedback = form.get('feedback');

    // Remove conditional validators before applying the new decision.
    lkProf?.clearValidators();
    lkScore?.clearValidators();
    requiredProf?.clearValidators();
    feedback?.clearValidators();

    if (decision === 'Approved') {
      lkProf?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]);

      lkScore?.setValidators([
        Validators.required,
        Validators.min(0),
        Validators.max(100)
      ]);

      // Clear upskill-only fields.
      requiredProf?.setValue(null);
      feedback?.setValue('');
    } else if (decision === 'Upskill Required') {
      requiredProf?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(5)
      ]);

      feedback?.setValidators([
        Validators.required,
        Validators.maxLength(2000)
      ]);

      // L&K proficiency and score are NOT required for upskilling.
      lkProf?.setValue(null);
      lkScore?.setValue(null);
    }

    [lkProf, lkScore, requiredProf, feedback].forEach(control => {
      control?.updateValueAndValidity();
    });
  }

  /**
   * Sends only skills marked "Upskill Required".
   * L&K proficiency and score are not sent to this endpoint.
   */
  sendToUpskill(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const upskillSkills = this.skillForms.controls.filter(
      control =>
        control.get('decision')?.value === 'Upskill Required'
    );

    if (upskillSkills.length === 0) {
      this.errorMessage =
        'Select at least one skill with the decision Upskill Required.';
      return;
    }

    for (const control of upskillSkills) {
      const form = control as FormGroup;

      const requiredProf = form.get('required_proficiency');
      const feedback = form.get('feedback');

      const proficiencyValue = requiredProf?.value;
      const feedbackValue = String(feedback?.value || '').trim();

      if (
        proficiencyValue === null ||
        proficiencyValue === '' ||
        Number(proficiencyValue) < 1 ||
        Number(proficiencyValue) > 5
      ) {
        this.errorMessage =
          'Select a required proficiency between 1 and 5 for every upskill skill.';

        requiredProf?.markAsTouched();
        return;
      }

      if (!feedbackValue) {
        this.errorMessage =
          'Enter feedback for every skill being sent to upskill.';

        feedback?.markAsTouched();
        return;
      }
    }

    const confirmed = confirm(
      `Send ${upskillSkills.length} skill(s) to upskill?`
    );

    if (!confirmed) {
      return;
    }

    const payload = {
      employee_id: this.employeeId,
      skills: upskillSkills.map(control => {
        const value = control.value;

        return {
          employee_skill_id: value.employee_skill_id,
          skill_id: Number(value.skill_id),
          required_proficiency: Number(value.required_proficiency),
          feedback: String(value.feedback).trim()
        };
      })
    };

    this.submitting = true;

    this.lkService.sendToUpskill(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;

        this.successMessage =
          res.message || 'Selected skills sent to upskill successfully.';

        setTimeout(() => {
          this.router.navigate(['/dashboard/lk/employees']);
        }, 1000);
      },
      error: (err: any) => {
        console.error('Failed to send skills to upskill:', err);

        this.errorMessage =
          err.error?.message || 'Failed to send skills to upskill.';

        this.submitting = false;
      }
    });
  }

  /**
   * Submits only Approved skills.
   * Approved skills require L&K proficiency and score.
   */
  submitReview(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const approvedSkills = this.skillForms.controls.filter(
      control => control.get('decision')?.value === 'Approved'
    );

    if (approvedSkills.length === 0) {
      this.errorMessage = 'Select at least one skill marked Approved.';
      return;
    }

    for (const control of approvedSkills) {
      const form = control as FormGroup;

      const proficiency = form.get('lk_proficiency');
      const score = form.get('lk_score');

      const profValue = proficiency?.value;
      const scoreValue = score?.value;

      if (
        profValue === null ||
        profValue === '' ||
        Number(profValue) < 1 ||
        Number(profValue) > 5
      ) {
        this.errorMessage =
          'Enter a valid L&K proficiency between 1 and 5 for every approved skill.';

        proficiency?.markAsTouched();
        return;
      }

      if (
        scoreValue === null ||
        scoreValue === '' ||
        Number(scoreValue) < 0 ||
        Number(scoreValue) > 100
      ) {
        this.errorMessage =
          'Enter a valid L&K score between 0 and 100 for every approved skill.';

        score?.markAsTouched();
        return;
      }
    }

    const payload = {
      employee_id: this.employeeId,
      skills: approvedSkills.map(control => {
        const value = control.value;

        return {
          employee_skill_id: value.employee_skill_id,
          skill_id: Number(value.skill_id),
          lk_proficiency: Number(value.lk_proficiency),
          lk_score: Number(value.lk_score),
          decision: 'Approved',
          feedback: value.feedback || null
        };
      })
    };

    this.submitting = true;

    this.lkService.submitSkillAssessment(payload).subscribe({
      next: (res: any) => {
        this.submitting = false;

        this.successMessage =
          res.message || 'Approved skill assessments submitted successfully.';

        setTimeout(() => {
          this.router.navigate(['/dashboard/lk']);
        }, 1000);
      },
      error: (err: any) => {
        console.error('Failed to submit approved assessments:', err);

        this.errorMessage =
          err.error?.message ||
          'Failed to submit approved assessments.';

        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/lk/employees']);
  }

  getResourceStatus(status: number): string {
    switch (Number(status)) {
      case 0:
        return 'Available';

      case 1:
        return 'Allocated';

      case 2:
        return 'Partially Available';

      default:
        return 'Unknown';
    }
  }
}
