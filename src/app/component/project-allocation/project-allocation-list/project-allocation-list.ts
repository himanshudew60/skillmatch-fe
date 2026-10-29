
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectAllocationService } from '../../../services/project-allocation';

@Component({
  selector: 'app-project-allocation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-allocation-list.html',
  styleUrl: './project-allocation-list.css'
})
export class ProjectAllocationList implements OnInit {

  projects: any[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private service: ProjectAllocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.service.getAllocations().subscribe({
      next: (res: any) => {
        console.log('Project allocation response:', res);

        const data = Array.isArray(res) ? res : (res.data ?? []);

        // Display the first three projects
        this.projects = data.slice(0, 3);

        this.loading = false;
      },
      error: (error: any) => {
        console.error('Failed to load projects:', error);
        this.errorMessage = 'Unable to load projects. Please try again.';
        this.loading = false;
      }
    });
  }

  allocateProject(project: any): void {
    this.router.navigate(
      ['dashboard/project-allocation/create'],
      { queryParams: { project_id: project.id } }
    );
  }

  editProject(project: any): void {
    this.router.navigate(
      ['dashboard/project-allocation/edit', project.id]
    );
  }
}
