import { Routes } from '@angular/router';
import { Home } from './component/home/home';
import { Dashboard } from './component/dashboard/dashboard';
import { Employees } from './component/employee/employees/employees';
import { Allocation } from './component/allocation/allocation';
import { authGuard } from './gaurds/auth-guard';
import { Users } from './component/user/users/users';
import { Add } from './component/user/add/add';
import { EmployeeAdd } from './component/employee/add/add';
import { View } from './component/employee/view/view';
import { Edit } from './component/employee/edit/edit';
import { ProjectListComponent } from './component/poject/projects/projects';
import { AddProjectComponent } from './component/poject/add/add';
import { EditProjectComponent } from './component/poject/edit/edit';
import { AddProjectRequirementComponent } from './component/project-requirement/add/add';
import { EditProjectRequirementComponent } from './component/project-requirement/edit/edit';
import { ViewProjectRequirementComponent } from './component/project-requirement/view/view';
import { ProjectRequirementListComponent } from './component/project-requirement/list/list';

export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'dashboard', component: Dashboard,
    children: [
      // employees
      { path: 'employees', component: Employees },
      { path: 'employees/addemployees', component: EmployeeAdd },
      { path: 'employees/viewemployees/:id', component: View },
      { path: 'employees/editemployees/:id', component: Edit },

      // Allocation
      { path: 'allocation', component: Allocation },

      // users
      { path: 'users', component: Users },
      { path: 'users/adduser', component: Add },

      // projects
      { path: 'projects', component: ProjectListComponent },
      { path: 'projects/addprojects', component: AddProjectComponent },
      { path: 'projects/editproject/:id', component: EditProjectComponent },



      // project requirment
      { path: 'requirements', component: ProjectRequirementListComponent },
      { path: 'requirements/addrequirements', component: AddProjectRequirementComponent },
      { path: 'requirements/editrequirements/:id', component: EditProjectRequirementComponent },
      { path: 'requirements/viewrequirements/:id', component: ViewProjectRequirementComponent }
    ], canActivate: [authGuard]
  },
  { path: '**', component: Home },
];
