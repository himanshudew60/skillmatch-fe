import { CommonModule } from '@angular/common';
import { Component ,Input} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink,RouterLinkActive,CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() loggedUser: any;


get userRoleId(): number {
  return Number(this.loggedUser?.role_id);
}

get isAdmin(): boolean {
  return this.userRoleId === 1;
}

get isLK(): boolean {
  return this.userRoleId === 2;
}

get isResourceManager(): boolean {
  return this.userRoleId === 3;
}

get isProjectManager(): boolean {
  return this.userRoleId === 4;
}

get isProjectAllocator(): boolean {
  return this.userRoleId === 5;
}
}
