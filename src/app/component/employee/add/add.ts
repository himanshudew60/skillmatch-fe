import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Employee } from '../../../services/employee';

interface EmployeeSkillForm {
  skill_id: number | null;
  skill_type: 'Primary' | 'Secondary' | 'Tertiary';
  proficiency: number | null;
  experience_months: number | null;
  certification: string;
  project_experience_months: number | null;
  skill_validation_status: 'Self' | 'Manager' | 'Assessment';
}

interface EmployeeFormData {

  emp_name: string;
  emp_email: string;
  department_id: number | null;
  designation_id: number | null;
  location: string;
  resource_status: number;
  available_from: string;
  skills: EmployeeSkillForm[];
}

@Component({
  selector: 'add-employee',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class EmployeeAdd implements OnInit {

  // ============================
  // Loading / Saving
  // ============================

  loading = false;
  saving = false;


  // ============================
  // Dropdown Data
  // ============================

  departments: any[] = [];
  designations: any[] = [];
  skills: any[] = [];


  // ============================
  // Employee Form
  // ============================

  employeeForm: EmployeeFormData = this.getEmptyEmployeeForm();


  constructor(
    private employeeService: Employee
  ) {}


  // ============================
  // INIT
  // ============================

  ngOnInit(): void {

    this.loadDepartments();
    this.loadDesignations();
    this.loadSkills();

  }


  // ============================
  // Empty Form
  // ============================

  getEmptyEmployeeForm(): EmployeeFormData {

    return {
     
      emp_name: '',
      emp_email: '',
      department_id: null,
      designation_id: null,
      location: '',
      resource_status: 0,
      available_from: '',
      skills: []
    };

  }


  // ============================
  // Load Departments
  // ============================

  loadDepartments(): void {

    this.employeeService.getDepartments().subscribe({

      next: (res: any) => {

        this.departments = res.data || [];

      },

      error: (err: any) => {

        console.error(
          'Failed to load departments:',
          err
        );

      }

    });

  }


  // ============================
  // Load Designations
  // ============================

  loadDesignations(): void {

    this.employeeService.getDesignations().subscribe({

      next: (res: any) => {

        this.designations = res.data || [];

      },

      error: (err: any) => {

        console.error(
          'Failed to load designations:',
          err
        );

      }

    });

  }


  // ============================
  // Load Skills
  // ============================

  loadSkills(): void {

    this.employeeService.getSkills().subscribe({

      next: (res: any) => {

        this.skills = res.data || [];

      },

      error: (err: any) => {

        console.error(
          'Failed to load skills:',
          err
        );

      }

    });

  }


  // ============================
  // Add Skill
  // ============================

  addSkill(): void {

    this.employeeForm.skills.push({

      skill_id: null,

      skill_type: 'Primary',

      proficiency: null,

      experience_months: null,

      certification: '',

      project_experience_months: null,

      skill_validation_status: 'Self'

    });

  }


  // ============================
  // Remove Skill
  // ============================

  removeSkill(index: number): void {

    if (
      index < 0 ||
      index >= this.employeeForm.skills.length
    ) {
      return;
    }

    this.employeeForm.skills.splice(index, 1);

  }


  // ============================
  // Validate Employee
  // ============================

  validateEmployee(): boolean {

   


    if (!this.employeeForm.emp_name.trim()) {

      alert('Please enter Employee Name.');

      return false;

    }


    if (!this.employeeForm.emp_email.trim()) {

      alert('Please enter Employee Email.');

      return false;

    }


    if (!this.isValidEmail(this.employeeForm.emp_email)) {

      alert('Please enter a valid email address.');

      return false;

    }


    if (!this.employeeForm.department_id) {

      alert('Please select Department.');

      return false;

    }


    if (!this.employeeForm.designation_id) {

      alert('Please select Designation.');

      return false;

    }


    // Validate Skills

    for (
      let i = 0;
      i < this.employeeForm.skills.length;
      i++
    ) {

      const skill = this.employeeForm.skills[i];

      if (!skill.skill_id) {

        alert(
          `Please select a skill for Skill ${i + 1}.`
        );

        return false;

      }


      if (!skill.proficiency) {

        alert(
          `Please select proficiency for Skill ${i + 1}.`
        );

        return false;

      }

    }


    return true;

  }


  // ============================
  // Email Validation
  // ============================

  isValidEmail(email: string): boolean {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(email);

  }


  // ============================
  // Save Employee
  // ============================

  saveEmployee(): void {

    if (!this.validateEmployee()) {

      return;

    }


    const payload = {

      

      emp_name:
        this.employeeForm.emp_name.trim(),

      emp_email:
        this.employeeForm.emp_email.trim(),

      department_id:
        this.employeeForm.department_id,

      designation_id:
        this.employeeForm.designation_id,

      location:
        this.employeeForm.location.trim(),

      resource_status:
        this.employeeForm.resource_status,

      available_from:
        this.employeeForm.available_from || null,

      skills:
        this.employeeForm.skills.map(skill => ({

          skill_id:
            skill.skill_id,

          skill_type:
            skill.skill_type,

          proficiency:
            skill.proficiency,

          experience_months:
            skill.experience_months,

          certification:
            skill.certification?.trim() || null,

          project_experience_months:
            skill.project_experience_months,

          skill_validation_status:
            skill.skill_validation_status

        }))

    };


    console.log(
      'Employee Payload:',
      payload
    );


    this.saving = true;


    this.employeeService
      .createEmployee(payload)
      .subscribe({

        next: (res: any) => {

          console.log(
            'Employee created successfully:',
            res
          );


          this.saving = false;


          alert(
            res.message ||
            'Employee created successfully.'
          );


          this.resetEmployeeForm();

        },


        error: (err: any) => {

  this.saving = false;

  console.log('FULL ERROR:', err);
  console.log('STATUS:', err.status);
  console.log('ERROR BODY:', err.error);

  if (err.status === 422) {

    const errors = err.error?.errors;

    if (errors) {

      const messages: string[] = [];

      Object.keys(errors).forEach((field) => {

        errors[field].forEach((message: string) => {
          messages.push(message);
        });

      });

      alert(messages.join('\n'));

    } else {

      alert(
        err.error?.message ||
        'Validation failed.'
      );

    }

  } else {

    alert(
      err.error?.message ||
      'Failed to create employee.'
    );

  }

}

      });

  }


  // ============================
  // Reset Form
  // ============================

  resetEmployeeForm(): void {

    this.employeeForm =
      this.getEmptyEmployeeForm();

  }


  // ============================
  // Close Modal
  // ============================

  closeEmployeeModal(): void {

    this.resetEmployeeForm();

  }

}