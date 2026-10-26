
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Employee } from '../../../services/employee';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class Edit implements OnInit {
  employeeId = 0;
  employeeCode = '';
  employeeForm: FormGroup;

  departments: any[] = [];
  designations: any[] = [];
  availableSkills: any[] = [];

  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: Employee
  ) {
    this.employeeForm = this.fb.group({
      emp_name: ['', [Validators.required, Validators.maxLength(255)]],
      emp_email: ['', [Validators.required, Validators.email]],
      department_id: ['', Validators.required],
      designation_id: ['', Validators.required],
      location: ['', Validators.required],
      resource_status: [0, Validators.required],
      available_from: [''],
      skills: this.fb.array([]),
    });
  }

  get skills(): FormArray {
    return this.employeeForm.get('skills') as FormArray;
  }

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(this.employeeId) || this.employeeId <= 0) {
      this.errorMessage = 'Invalid employee ID.';
      this.loading = false;
      return;
    }

    forkJoin({
      departments: this.employeeService.getDepartments(),
      designations: this.employeeService.getDesignations(),
      skills: this.employeeService.getSkills(),
      employee: this.employeeService.getEmployee(this.employeeId),
    }).subscribe({
      next: (res: any) => {
        this.departments = res.departments.data ?? [];
        this.designations = res.designations.data ?? [];
        this.availableSkills = res.skills.data ?? [];

        const employee = res.employee.data.employee;
        const employeeSkills = res.employee.data.skills ?? [];

        this.employeeCode = employee.emp_code;

        this.employeeForm.patchValue({
          emp_name: employee.emp_name,
          emp_email: employee.emp_email,
          department_id: String(employee.department_id),
          designation_id: String(employee.designation_id),
          location: employee.location,
          resource_status: Number(employee.resource_status),
          available_from: employee.available_from
            ? String(employee.available_from).slice(0, 10)
            : '',
        });

        this.skills.clear();

        employeeSkills.forEach((skill: any) => {
          this.skills.push(
            this.createSkillForm({
              skill_id: String(skill.skill_id),
              skill_type: skill.skill_type,
              proficiency: skill.proficiency,
              experience_months: skill.experience,
              assessment_score: skill.assessment_score,
              certification: skill.certification,
              project_experience_months: skill.project_experience,
              skill_validation_status: skill.skill_validation_status,
            })
          );
        });

        this.loading = false;
      },
      error: (err: any) => {
        console.error('Edit employee loading error:', err);
        this.errorMessage =
          err.error?.message || 'Failed to load employee information.';
        this.loading = false;
      },
    });
  }

  private createSkillForm(skill?: any): FormGroup {
    return this.fb.group({
      skill_id: [skill?.skill_id ?? '', Validators.required],
      skill_type: [skill?.skill_type ?? 'Primary', Validators.required],
      proficiency: [
        skill?.proficiency ?? null,
        [Validators.min(1), Validators.max(5)],
      ],
      experience_months: [
        skill?.experience_months ?? null,
        Validators.min(0),
      ],
      assessment_score: [
        skill?.assessment_score ?? null,
        [Validators.min(0), Validators.max(100)],
      ],
      certification: [skill?.certification ?? ''],
      project_experience_months: [
        skill?.project_experience_months ?? null,
        Validators.min(0),
      ],
      skill_validation_status: [
        skill?.skill_validation_status ?? 'Self',
        Validators.required,
      ],
    });
  }

  addSkill(): void {
    this.skills.push(this.createSkillForm());
  }

  removeSkill(index: number): void {
    this.skills.removeAt(index);
  }

  skillName(skillId: string | number): string {
    const skill = this.availableSkills.find(
      (item: any) => Number(item.id) === Number(skillId)
    );

    return skill?.name ?? 'Selected skill';
  }

  saveChanges(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    const payload = {
      ...this.employeeForm.getRawValue(),
      department_id: Number(this.employeeForm.value.department_id),
      designation_id: Number(this.employeeForm.value.designation_id),
      resource_status: Number(this.employeeForm.value.resource_status),
      available_from: this.employeeForm.value.available_from || null,

      skills: this.skills.getRawValue().map((skill: any) => ({
        ...skill,
        skill_id: Number(skill.skill_id),
        proficiency:
          skill.proficiency === '' || skill.proficiency == null
            ? null
            : Number(skill.proficiency),
        experience_months:
          skill.experience_months === '' ||
          skill.experience_months == null
            ? null
            : Number(skill.experience_months),
        assessment_score:
          skill.assessment_score === '' ||
          skill.assessment_score == null
            ? null
            : Number(skill.assessment_score),
        project_experience_months:
          skill.project_experience_months === '' ||
          skill.project_experience_months == null
            ? null
            : Number(skill.project_experience_months),
        certification: skill.certification || null,
      })),
    };

    const skillIds = payload.skills.map((skill: any) => skill.skill_id);

    if (new Set(skillIds).size !== skillIds.length) {
      this.errorMessage = 'Each skill can only be selected once.';
      return;
    }

    this.saving = true;

    this.employeeService
      .updateEmployee(this.employeeId, payload)
      .subscribe({
        next: (res:any) => {
          console.log(res);
          
          this.saving = false;
          this.router.navigate([
            '/dashboard/employees/viewemployees',
            this.employeeId,
          ]);
        },
        error: (err: any) => {
          console.error('Update employee error:', err);
          this.saving = false;
          this.errorMessage =
            err.error?.message || 'Failed to update employee.';
        },
      });
  }
   goBack(): void {
    window.history.back();
  }
}
