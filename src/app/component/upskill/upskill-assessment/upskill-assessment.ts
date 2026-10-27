import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LkService } from '../../../services/lk';

@Component({
  selector: 'app-upskill-assessment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './upskill-assessment.html',
  styleUrls: ['./upskill-assessment.css']
})
export class UpskillAssessment implements OnInit {
  requestId!: number;
  request: any = null;
  assessmentForm!: FormGroup;

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
    this.assessmentForm = this.fb.group({
      assessment_score: [
        '',
        [Validators.required, Validators.min(0), Validators.max(100)]
      ],
      proficiency: [
        '',
        [Validators.required, Validators.min(1), Validators.max(5)]
      ],
      skill_type: ['Secondary'],
      lk_remarks: ['', [Validators.maxLength(2000)]]
    });

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      if (!id || !Number.isInteger(id)) {
        this.errorMessage = 'Invalid upskill request ID.';
        return;
      }

      this.requestId = id;
      this.loadRequest();
    });
  }

  loadRequest(): void {
    this.loading = true;
    this.errorMessage = '';

    this.lkService.getUpskillRequest(this.requestId).subscribe({
      next: (res: any) => {
        this.request = res.data || null;

        if (!this.request) {
          this.errorMessage = 'Upskill request not found.';
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load upskill request:', err);
        this.errorMessage =
          err.error?.message || 'Failed to load upskill request.';
        this.loading = false;
      }
    });
  }

  submitAssessment(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.assessmentForm.invalid) {
      this.assessmentForm.markAllAsTouched();
      this.errorMessage =
        'Please enter a valid assessment score and proficiency.';
      return;
    }

    const confirmed = confirm(
      'Submit this upskill assessment and return the employee for final L&K review?'
    );

    if (!confirmed) {
      return;
    }

    const value = this.assessmentForm.getRawValue();

    const payload = {
      assessment_score: Number(value.assessment_score),
      proficiency: Number(value.proficiency),
      skill_type: value.skill_type,
      lk_remarks: String(value.lk_remarks || '').trim()
    };

    this.submitting = true;

    this.lkService
      .submitUpskillAssessment(this.requestId, payload)
      .subscribe({
        next: (res: any) => {
          this.submitting = false;
          this.successMessage =
            res.message || 'Upskill assessment submitted successfully.';

          setTimeout(() => {
            this.router.navigate(['/dashboard/lk/employees']);
          }, 1000);
        },
        error: (err: any) => {
          console.error('Failed to submit assessment:', err);
          this.errorMessage =
            err.error?.message || 'Failed to submit assessment.';
          this.submitting = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/lk/upskill-requests']);
  }

  get scoreControl() {
    return this.assessmentForm.get('assessment_score');
  }

  get proficiencyControl() {
    return this.assessmentForm.get('proficiency');
  }
}