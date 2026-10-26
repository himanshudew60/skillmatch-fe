import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProjectRequirementService } from '../../../services/project-requirement';

@Component({
  selector: 'app-add-project-requirement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class AddProjectRequirementComponent implements OnInit {

  projects: any[] = [];
  skills: any[] = [];

  requirement = {
    project_id: null as number | null,

    required_resources: 1,

    primary_skill_id: null as number | null,
    primary_proficiency: 1,

    secondary_skill_id: null as number | null,
    secondary_proficiency: 1,

    tertiary_skill_id: null as number | null,
    tertiary_proficiency: 1,

    requirement_description: ''
  };

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private requirementService: ProjectRequirementService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {

    this.loading = true;

    this.requirementService.getProjects().subscribe({

      next: (projectRes: any) => {

        this.projects = projectRes.data ?? [];

        this.requirementService.getSkills().subscribe({

          next: (skillRes: any) => {

            this.skills = skillRes.data ?? [];
            this.loading = false;

          },

          error: () => {

            this.errorMessage =
              'Failed to load skills.';

            this.loading = false;
          }

        });

      },

      error: () => {

        this.errorMessage =
          'Failed to load projects.';

        this.loading = false;
      }

    });
  }

  saveRequirement(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.requirement.project_id) {

      this.errorMessage =
        'Please select a project.';

      return;
    }

    if (this.requirement.required_resources < 1) {

      this.errorMessage =
        'Required resources must be at least 1.';

      return;
    }

    if (!this.requirement.primary_skill_id) {

      this.errorMessage =
        'Please select a primary skill.';

      return;
    }

    if (
      this.requirement.primary_proficiency < 1 ||
      this.requirement.primary_proficiency > 5
    ) {

      this.errorMessage =
        'Primary proficiency must be between 1 and 5.';

      return;
    }

    if (
      this.requirement.secondary_skill_id &&
      (
        this.requirement.secondary_proficiency < 1 ||
        this.requirement.secondary_proficiency > 5
      )
    ) {

      this.errorMessage =
        'Secondary proficiency must be between 1 and 5.';

      return;
    }

    if (
      this.requirement.tertiary_skill_id &&
      (
        this.requirement.tertiary_proficiency < 1 ||
        this.requirement.tertiary_proficiency > 5
      )
    ) {

      this.errorMessage =
        'Tertiary proficiency must be between 1 and 5.';

      return;
    }

    const selectedSkills = [
      this.requirement.primary_skill_id,
      this.requirement.secondary_skill_id,
      this.requirement.tertiary_skill_id
    ].filter(id => id !== null);

    if (
      new Set(selectedSkills).size !== selectedSkills.length
    ) {

      this.errorMessage =
        'Primary, secondary and tertiary skills must be different.';

      return;
    }

    this.saving = true;

    this.requirementService
      .createRequirement(this.requirement)
      .subscribe({

        next: (res: any) => {

          this.saving = false;

          this.successMessage =
            res.message ||
            'Project requirement created successfully.';

          setTimeout(() => {

            this.router.navigate([
              '/dashboard/projects/requirements'
            ]);

          }, 800);
        },

        error: (err: any) => {

          this.saving = false;

          if (err.error?.errors) {

            this.errorMessage =
              Object.values(err.error.errors)
                .flat()
                .join(' ');

          } else {

            this.errorMessage =
              err.error?.message ||
              'Failed to create project requirement.';
          }
        }

      });
  }
}