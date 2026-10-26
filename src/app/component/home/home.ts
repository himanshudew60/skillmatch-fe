
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  userId = '';
  password = '';

  showPassword = false;
  loading = false;
  errorMessage = '';


  constructor(
    private auth: Auth,
    private router: Router
  ) {}


  // =====================================================
  // LOGIN
  // =====================================================

  login(): void {

    this.errorMessage = '';


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!this.userId || !this.password) {

      this.errorMessage =
        'Please enter User ID and Password.';

      return;
    }


    // -----------------------------------------------------
    // START LOADING
    // -----------------------------------------------------

    this.loading = true;


    const param = {
      user_id: this.userId,
      password: this.password
    };


    // -----------------------------------------------------
    // API LOGIN
    // -----------------------------------------------------

    this.auth.login(param).subscribe({

      // ===================================================
      // SUCCESS
      // ===================================================

      next: (res: any) => {


localStorage.setItem('access_token',res.result.token );        
        console.log('Login response:', res);

        this.loading = false;


        // Make sure token exists
        if (!res?.result?.token) {

          this.errorMessage =
            'Login failed. Authentication token was not received.';

          return;
        }


        // -------------------------------------------------
        // SUCCESS ALERT
        // -------------------------------------------------

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome to SkillMatch AI.',
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {


          // -----------------------------------------------
          // REDIRECT TO DASHBOARD
          // -----------------------------------------------

          this.router.navigate(['/dashboard']);

        });

      },


      // ===================================================
      // ERROR
      // ===================================================

      error: (error: any) => {

        console.error('Login error:', error);

        this.loading = false;


        // -------------------------------------------------
        // TOO MANY REQUESTS
        // HTTP 429
        // -------------------------------------------------

        if (error.status === 429) {

          Swal.fire({
            icon: 'warning',
            title: 'Too Many Attempts',
            text: 'Too many login attempts. Please wait a few minutes and try again.',
            confirmButtonText: 'OK'
          });

          this.errorMessage =
            'Too many login attempts. Please try again later.';

          return;
        }


        // -------------------------------------------------
        // INVALID LOGIN
        // HTTP 401
        // -------------------------------------------------

        if (error.status === 401) {

          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Invalid User ID or Password.',
            confirmButtonText: 'Try Again'
          });

          this.errorMessage =
            'Invalid User ID or Password.';

          return;
        }


        // -------------------------------------------------
        // VALIDATION ERROR
        // HTTP 422
        // -------------------------------------------------

        if (error.status === 422) {

          Swal.fire({
            icon: 'warning',
            title: 'Invalid Input',
            text: 'Please enter a valid User ID and Password.',
            confirmButtonText: 'OK'
          });

          this.errorMessage =
            'Please enter a valid User ID and Password.';

          return;
        }


        // -------------------------------------------------
        // FORBIDDEN
        // HTTP 403
        // -------------------------------------------------

        if (error.status === 403) {

          Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: error.error?.message ??
              'Your account is not allowed to access the system.',
            confirmButtonText: 'OK'
          });

          this.errorMessage =
            'You are not authorized to access the system.';

          return;
        }


        // -------------------------------------------------
        // SERVER ERROR
        // -------------------------------------------------

        Swal.fire({
          icon: 'error',
          title: 'Something Went Wrong',
          text: 'Unable to connect to the server. Please try again later.',
          confirmButtonText: 'OK'
        });

        this.errorMessage =
          'Unable to connect to the server. Please try again later.';

      }

    });

  }

}
