
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MasterDataService } from '../../../services/master-service';

@Component({
  selector: 'app-skill-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './skill-list.html',
  styleUrl: './skill-list.css'
})
export class SkillListComponent implements OnInit {

  skills: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  loadSkills(): void {
    this.loading = true;

    this.masterDataService.getSkills().subscribe({
      next: (res: any) => {
        this.skills = res.data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to load skills.';
        this.loading = false;
      }
    });
  }

  deleteSkill(id: number): void {
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    this.masterDataService.deleteSkill(id).subscribe({
      next: (res: any) => {
        this.successMessage =
          res.message || 'Skill deleted successfully.';
        this.loadSkills();
      },
      error: (err: any) => {
        this.errorMessage =
          err.error?.message || 'Failed to delete skill.';
      }
    });
  }
}
