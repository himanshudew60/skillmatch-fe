import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { User } from '../../../services/user';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './edit.html',
  styleUrl: './edit.css',
})
export class EditUserComponent implements OnInit {

  userIdParam!: number;

  filteredEmployees: any[] = [];
  employees: any[] = [];
  roles: any[] = [];

  showEmployeeDropdown = false;

  employeeSearch = '';

  selectedEmployeeId: number | null = null;
  selectedEmployee: any = null;

  userId = '';
  password = '';
  roleId: number | null = null;

  loading = true;
  saving = false;

  errorMessage = '';
  successMessage = '';

  constructor(
    private userService: User,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.userIdParam = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!this.userIdParam) {
      this.errorMessage = 'Invalid user ID.';
      this.loading = false;
      return;
    }

    this.loadInitialData();
  }


  loadInitialData(): void {

    this.loading = true;
    this.errorMessage = '';

    /*
     * Load roles and current user.
     */
    this.userService.getRoles().subscribe({
      next: (res: any) => {

        this.roles = res.data ?? [];

        this.loadUser();

      },

      error: (err: any) => {

        this.errorMessage =
          err.error?.message || 'Failed to load roles.';

        this.loading = false;

      }
    });

  }


  loadUser(): void {

    this.userService.getUser(this.userIdParam).subscribe({

      next: (res: any) => {

        const user = res.data;

        if (!user) {

          this.errorMessage = 'User not found.';
          this.loading = false;

          return;
        }

        /*
         * Set existing user information.
         */
        this.selectedEmployeeId =
          user.employee_id
            ? Number(user.employee_id)
            : null;

        this.roleId =
          user.role_id
            ? Number(user.role_id)
            : null;

        this.userId = user.user_id || '';

        /*
         * Current employee information.
         */
        if (user.employee_id) {

          this.selectedEmployee = {
            id: Number(user.employee_id),
            emp_name: user.emp_name,
            emp_code: user.emp_code,
            emp_email: user.emp_email,
            department_name: user.department_name
          };

          this.employeeSearch =
            `${user.emp_name} (${user.emp_code})`;

        }

        /*
         * Load employees after current user is loaded.
         */
        this.loadEmployees();

      },

      error: (err: any) => {

        this.errorMessage =
          err.error?.message || 'Failed to load user.';

        this.loading = false;

      }

    });

  }


  loadEmployees(): void {

    this.userService
      .getAvailableEmployees('')
      .subscribe({

        next: (res: any) => {

          this.employees = res.data ?? [];

          /*
           * Add the current employee if the backend
           * excludes employees that already have accounts.
           */
          if (
            this.selectedEmployee &&
            !this.employees.some(
              employee =>
                Number(employee.id) ===
                Number(this.selectedEmployee.id)
            )
          ) {

            this.employees.unshift(
              this.selectedEmployee
            );

          }

          this.filteredEmployees = [...this.employees];

          this.loading = false;

        },

        error: (err: any) => {

          this.errorMessage =
            err.error?.message ||
            'Failed to load employees.';

          this.loading = false;

        }

      });

  }


  filterEmployees(): void {

    const search =
      this.employeeSearch
        .trim()
        .toLowerCase();

    this.filteredEmployees =
      this.employees.filter(employee =>

        [
          employee.emp_name,
          employee.emp_code,
          employee.emp_email,
          employee.department_name
        ].some(value =>
          String(value ?? '')
            .toLowerCase()
            .includes(search)
        )

      );

    this.showEmployeeDropdown = true;

  }


  selectEmployee(employee: any): void {

    this.selectedEmployeeId =
      Number(employee.id);

    this.selectedEmployee =
      employee;

    this.employeeSearch =
      `${employee.emp_name} (${employee.emp_code})`;

    /*
     * Keep the existing login ID when editing.
     *
     * We do NOT automatically overwrite it here.
     */
    this.showEmployeeDropdown = false;

  }


  clearEmployee(): void {

    this.selectedEmployeeId = null;

    this.selectedEmployee = null;

    this.employeeSearch = '';

    /*
     * Do not clear userId here.
     * Login ID is an independent field.
     */

    this.filteredEmployees =
      [...this.employees];

    this.showEmployeeDropdown = true;

  }


  closeEmployeeDropdown(): void {

    setTimeout(() => {

      this.showEmployeeDropdown = false;

    }, 150);

  }


  updateUser(): void {

    this.errorMessage = '';
    this.successMessage = '';

    /*
     * Validate employee and role.
     */
    if (
      !this.selectedEmployeeId ||
      !this.roleId
    ) {

      this.errorMessage =
        'Please select an employee and a role.';

      return;

    }


    /*
     * Validate login ID.
     */
    if (!this.userId.trim()) {

      this.errorMessage =
        'Please enter a login ID.';

      return;

    }


    /*
     * Password is optional during edit.
     *
     * But if entered, it must contain
     * at least 8 characters.
     */
    if (
      this.password &&
      this.password.length < 8
    ) {

      this.errorMessage =
        'Password must contain at least 8 characters.';

      return;

    }


    this.saving = true;


    const payload: any = {

      employee_id:
        Number(this.selectedEmployeeId),

      role_id:
        Number(this.roleId),

      user_id:
        this.userId.trim()

    };


    /*
     * Only send password when user entered one.
     *
     * This allows backend to keep the
     * existing password.
     */
    if (this.password.trim()) {

      payload.password =
        this.password;

    }


    this.userService
      .updateUser(
        this.userIdParam,
        payload
      )
      .subscribe({

        next: (res: any) => {

          this.successMessage =
            res.message ||
            'User updated successfully.';

          this.saving = false;

          /*
           * Navigate back to user list.
           */
          this.router.navigate([
            '/dashboard/users'
          ]);

        },

        error: (err: any) => {

          this.saving = false;

          if (
            err.status === 422 &&
            err.error?.errors
          ) {

            const errors =
              err.error.errors;

            this.errorMessage =
              Object.values(errors)
                .flat()
                .join(' ');

          } else {

            this.errorMessage =
              err.error?.message ||
              'Failed to update user.';

          }

        }

      });

  }

}