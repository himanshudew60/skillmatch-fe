import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../services/project';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class ProjectListComponent implements OnInit {

  projects: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {

    this.loading = true;

    this.projectService.getProjects().subscribe({

      next: (res: any) => {
        this.projects = res.data ?? [];
        this.loading = false;
      },

      error: (err: any) => {
        this.errorMessage =
          err.error?.message ||
          'Failed to load projects.';

        this.loading = false;
      }

    });
  }

  deleteProject(project: any): void {

    const confirmed = confirm(
      `Are you sure you want to delete "${project.project_name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(project.id).subscribe({

      next: () => {
        this.projects =
          this.projects.filter(
            p => p.id !== project.id
          );
      },

      error: (err: any) => {
        alert(
          err.error?.message ||
          'Failed to delete project.'
        );
      }

    });
  }
}