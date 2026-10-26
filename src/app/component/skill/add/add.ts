
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-add-skill',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './add.html',
  styleUrl: './add.css'
})
export class AddSkillComponent {

  skill = {
    name: '',
    category: 'Programming'
  };

  categories = [
    'Programming',
    'Backend',
    'Frontend',
    'Database',
    'Cloud',
    'DevOps'
  ];

  saving = false;
  errorMessage = '';

  constructor(
    private masterDataService: MasterDataService,
    private router: Router
  ) {}

  saveSkill(): void {

    this.errorMessage = '';

    if (!this.skill.name.trim()) {
      this.errorMessage = 'Skill name is required.';
      return;
    }

    this.saving = true;

    this.masterDataService.createSkill({
      name: this.skill.name.trim(),
      category: this.skill.category
    }).subscribe({

      next: () => {
        this.router.navigate(['/dashboard/skills']);
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
            err.error?.message || 'Failed to create skill.';
        }
      }
    });
  }
}
