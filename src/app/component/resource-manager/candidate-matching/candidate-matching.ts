import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourceManagerService } from '../../../services/resource-manager';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-candidate-matching',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './candidate-matching.html',
  styleUrls: ['./candidate-matching.css']
})
export class CandidateMatching implements OnInit {
  requirement: any = null;
  candidates: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResourceManagerService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || !Number.isInteger(id)) {
      this.errorMessage = 'Invalid requirement ID.';
      return;
    }

    this.loading = true;

    this.service.getRecommendations(id).subscribe({
      next: (res: any) => {
        this.requirement = res.requirement;
        this.candidates = res.candidates || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to generate recommendations.';
        this.loading = false;
      }
    });
  }
  selectedCandidate: any = null;
submittingUpskill = false;

upskillForm = {
  skill_id: null as number | null,
  required_proficiency: 3,
  feedback: ''
};

requestUpskill(candidate: any): void {
  this.router.navigate(
    ['/dashboard/resource-manager/candidate-review', candidate.employee.id],
    {
      state: {
        candidate: candidate,
        requirement: this.requirement
      },
      queryParams: {
        action: 'upskill',
        requirementId: this.requirement.id
      }
    }
  );
}

closeUpskillRequest(): void {
  this.selectedCandidate = null;
}

submitUpskillRequest(): void {
  if (
    !this.selectedCandidate ||
    !this.upskillForm.skill_id ||
    !this.upskillForm.feedback.trim()
  ) {
    alert('Please select a skill and enter feedback.');
    return;
  }

  this.submittingUpskill = true;

  const payload = {
    employee_id: this.selectedCandidate.employee.id,
    project_requirement_id: this.requirement.id,
    skill_id: this.upskillForm.skill_id,
    required_proficiency: this.upskillForm.required_proficiency,
    feedback: this.upskillForm.feedback.trim()
  };

  this.service
    .sendUpskillRequest(payload)
    .subscribe({
      next: () => {
        alert('Upskill request sent to L&K successfully.');
        this.selectedCandidate = null;
        this.submittingUpskill = false;
      },
      error: (error: any) => {
        console.error('Upskill request failed:', error);
        alert(
          error?.error?.message ||
          'Unable to send the upskill request. Please try again.'
        );
        this.submittingUpskill = false;
      }
    });
}

  back(): void {
    this.router.navigate([
      '/dashboard/resource-manager'
    ]);
  }

  reviewCandidate(candidate: any): void {
    // Candidate-review and allocation-decision APIs can be connected next.
    alert(
      `${candidate.employee.emp_name}\n` +
      `Match score: ${candidate.match_score}%\n` +
      `Eligible: ${candidate.eligible ? 'Yes' : 'No'}`
    );
  }
}