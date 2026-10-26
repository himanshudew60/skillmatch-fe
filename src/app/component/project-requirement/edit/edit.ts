
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectRequirementService } from '../../../services/project-requirement';

@Component({
  selector: 'app-edit-project-requirement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class EditProjectRequirementComponent implements OnInit {

  requirementId!: number;

  projects: any[] = [];
  skills: any[] = [];

  requirement = {
    project_id: null as number | null,

    required_resources: 1,

    primary_skill_id: null as number | null,
    primary_proficiency: null as number | null,

    secondary_skill_id: null as number | null,
    secondary_proficiency: null as number | null,

    tertiary_skill_id: null as number | null,
    tertiary_proficiency: null as number | null,

    requirement_description: ''
  };

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  proficiencyLevels = [1, 2, 3, 4, 5];

  constructor(
    private requirementService: ProjectRequirementService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.requirementId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.requirementId) {
      this.errorMessage = 'Invalid requirement ID.';
      this.loading = false;
      return;
    }

    this.loadProjects();
    this.loadSkills();
    this.loadRequirement();
  }

  loadProjects(): void {

    this.requirementService.getProjects().subscribe({
      next: (res: any) => {
        this.projects = res.data ?? [];
      },
      error: () => {
        this.errorMessage = 'Failed to load projects.';
      }
    });
  }

  loadSkills(): void {

    this.requirementService.getSkills().subscribe({
      next: (res: any) => {
        this.skills = res.data ?? [];
      },
      error: () => {
        this.errorMessage = 'Failed to load skills.';
      }
    });
  }

  loadRequirement(): void {

    this.requirementService
      .getRequirement(this.requirementId)
      .subscribe({
        next: (res: any) => {

          const data = res.data;

          this.requirement = {
            project_id: data.project_id
              ? Number(data.project_id)
              : null,

            required_resources: Number(
              data.required_resources ?? 1
            ),

            primary_skill_id: data.primary_skill_id
              ? Number(data.primary_skill_id)
              : null,

            primary_proficiency: data.primary_proficiency !== null &&
              data.primary_proficiency !== undefined
              ? Number(data.primary_proficiency)
              : null,

            secondary_skill_id: data.secondary_skill_id
              ? Number(data.secondary_skill_id)
              : null,

            secondary_proficiency:
              data.secondary_proficiency !== null &&
              data.secondary_proficiency !== undefined
                ? Number(data.secondary_proficiency)
                : null,

            tertiary_skill_id: data.tertiary_skill_id
              ? Number(data.tertiary_skill_id)
              : null,

            tertiary_proficiency:
              data.tertiary_proficiency !== null &&
              data.tertiary_proficiency !== undefined
                ? Number(data.tertiary_proficiency)
                : null,

            requirement_description:
              data.requirement_description || ''
          };

          this.loading = false;
        },

        error: (err: any) => {

          this.errorMessage =
            err.error?.message ||
            'Failed to load requirement.';

          this.loading = false;
        }
      });
  }

  validate(): boolean {

    this.errorMessage = '';

    if (!this.requirement.project_id) {
      this.errorMessage = 'Please select a project.';
      return false;
    }

    if (
      !this.requirement.required_resources ||
      this.requirement.required_resources < 1
    ) {
      this.errorMessage =
        'Required resources must be at least 1.';
      return false;
    }

    if (
      this.requirement.primary_skill_id &&
      !this.requirement.primary_proficiency
    ) {
      this.errorMessage =
        'Please select proficiency for the primary skill.';
      return false;
    }

    if (
      this.requirement.secondary_skill_id &&
      !this.requirement.secondary_proficiency
    ) {
      this.errorMessage =
        'Please select proficiency for the secondary skill.';
      return false;
    }

    if (
      this.requirement.tertiary_skill_id &&
      !this.requirement.tertiary_proficiency
    ) {
      this.errorMessage =
        'Please select proficiency for the tertiary skill.';
      return false;
    }

    const skillIds = [
      this.requirement.primary_skill_id,
      this.requirement.secondary_skill_id,
      this.requirement.tertiary_skill_id
    ].filter(id => id !== null);

    const uniqueSkillIds = new Set(skillIds);

    if (skillIds.length !== uniqueSkillIds.size) {
      this.errorMessage =
        'The same skill cannot be selected more than once.';
      return false;
    }

    if (skillIds.length === 0) {
      this.errorMessage =
        'Please select at least one skill.';
      return false;
    }

    return true;
  }

  updateRequirement(): void {

    this.successMessage = '';

    if (!this.validate()) {
      return;
    }

    this.saving = true;

    const payload = {
      project_id: this.requirement.project_id,

      required_resources:
        Number(this.requirement.required_resources),

      primary_skill_id:
        this.requirement.primary_skill_id,

      primary_proficiency:
        this.requirement.primary_skill_id
          ? Number(this.requirement.primary_proficiency)
          : null,

      secondary_skill_id:
        this.requirement.secondary_skill_id,

      secondary_proficiency:
        this.requirement.secondary_skill_id
          ? Number(this.requirement.secondary_proficiency)
          : null,

      tertiary_skill_id:
        this.requirement.tertiary_skill_id,

      tertiary_proficiency:
        this.requirement.tertiary_skill_id
          ? Number(this.requirement.tertiary_proficiency)
          : null,

      requirement_description:
        this.requirement.requirement_description
    };

    this.requirementService
      .updateRequirement(this.requirementId, payload)
      .subscribe({

        next: (res: any) => {

          this.saving = false;

          this.successMessage =
            res.message ||
            'Project requirement updated successfully.';

          setTimeout(() => {
            this.router.navigate([
              '/dashboard/requirements'
            ]);
          }, 800);
        },

        error: (err: any) => {

          this.saving = false;

          if (err.error?.errors) {

            const errors = err.error.errors;

            this.errorMessage =
              Object.values(errors)
                .flat()
                .join(' ');

          } else {

            this.errorMessage =
              err.error?.message ||
              'Failed to update requirement.';
          }
        }
      });
  }
}
