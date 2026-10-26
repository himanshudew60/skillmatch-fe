
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-edit-skill',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit.html',
  styleUrl: './edit.css'
})
export class EditSkillComponent implements OnInit {

  skillId!: number;

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

  loading = true;
  saving = false;
  errorMessage = '';

  constructor(
    private masterDataService: MasterDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.skillId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.skillId) {
      this.errorMessage = 'Invalid skill ID.';
      this.loading = false;
      return;
    }

    this.loadSkill();
  }

  loadSkill(): void {

    this.masterDataService.getSkill(this.skillId).subscribe({

      next: (res: any) => {

        const data = res.data;

        this.skill = {
          name: data.name || '',
          category: data.category || 'Programming'
        };

        this.loading = false;
      },

      error: (err: any) => {

        this.errorMessage =
          err.error?.message || 'Failed to load skill.';

        this.loading = false;
      }
    });
  }

  updateSkill(): void {

    this.errorMessage = '';

    if (!this.skill.name.trim()) {
      this.errorMessage = 'Skill name is required.';
      return;
    }

    this.saving = true;

    this.masterDataService
      .updateSkill(this.skillId, {
        name: this.skill.name.trim(),
        category: this.skill.category
      })
      .subscribe({

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
              err.error?.message || 'Failed to update skill.';
          }
        }
      });
  }
}
