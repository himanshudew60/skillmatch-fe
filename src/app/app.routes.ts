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

export const routes: Routes = [
    { path: '', component: Home },
    {
        path: 'dashboard', component: Dashboard,
        children: [
            { path: 'employees', component: Employees },
            { path: 'employees/addemployees', component: EmployeeAdd },
            { path: 'employees/viewemployees/:id', component: View },
            { path: 'employees/editemployees/:id', component: Edit },
            { path: 'allocation', component: Allocation },
            { path: 'users', component: Users },
            { path: 'users/adduser', component: Add },
        ],canActivate:[authGuard]
    },
    { path: '**', component: Home },
];
