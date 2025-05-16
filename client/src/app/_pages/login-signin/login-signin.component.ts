import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../_services/login.service';
import { SnackBarService } from '../../_services/snack-bar.service';
import { TooltipPosition, MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { TrainersService } from '../../_services/trainers.service';
import { CommonModule } from '@angular/common';
import { SetupService } from '../../_services/setup.service';
import { RolesService } from '../../_services/roles.service';
import { forkJoin, Subscription, switchMap } from 'rxjs';
import { RolesCreateDto } from '../../_interfaces/roles-create-dto';
import { SettingService } from '../../_services/setting.service';
import { NetworkService } from '../../_services/network.service';

@Component({
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './login-signin.component.html',
  styleUrl: './login-signin.component.scss'
})
export class LoginSigninComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly matSnackBar = inject(SnackBarService);
  private readonly trainerService = inject(TrainersService);
  private readonly setupService = inject(SetupService);
  private readonly roleService = inject(RolesService);
  private readonly settingService = inject(SettingService);
  private readonly networkService = inject(NetworkService);
  private selectedFile: File | null = null;
  private subs: Subscription = new Subscription();

  showMigration : boolean = false;
  showAccount : boolean = false;
  form! : FormGroup;
  hide : boolean = true; // Hide password and Show password

  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[3]);

  constructor()
  {
    sessionStorage.clear();

    this.subs.add(
      this.setupService.checkDatabase().subscribe({
        next: (result: boolean) => {
          this.showMigration = !result;
          if(result) { this.showAccount = this.hasTrainerData(); }
        },
        error: (error) => {
          console.error('Error checking database:', error);
          this.showMigration = false;
        }
      })
    );
  }

  ngOnInit(): void {
    this.initializeForm();

    if (!this.showMigration)
    {
      this.showAccount = true;
    }
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', Validators.required]
    });
  }

  get emailInput() {
    return this.form.get('email');
  }
  get passwordInput() {
    return this.form.get('password');
  }

  // Reset all forms errors
  private resetFormErrors() {
    ['email', 'password'].forEach(field => {
      this.form.get(field)?.setErrors(null);
      this.form.get(field)?.updateValueAndValidity();
    });
  }

  signIn() : void
  {
    this.resetFormErrors();
    if(!this.form.invalid)
      {
        // Verifica se o usuário está online
        if(this.networkService.isOnline)
          {
            this.subs.add(
              this.loginService.loginSignIn(this.form.value).subscribe({
                next : () => {
                  this.form.reset(); // limpa os campos

                  // Limpa os erros manualmente
                  Object.keys(this.form.controls).forEach(key => {
                    this.form.get(key)?.setErrors(null);
                  });

                  this.matSnackBar.show('Sign in successful. Welcome back!', 'success');
                  this.router.navigate(['/']);
                },
                error: (error : HttpErrorResponse) => {
                  if (error!.status === 400 || error!.status === 404)
                    {
                      this.matSnackBar.show('Oops! Incorrect email or password...', 'error');
                    }
                    else
                    {
                      this.matSnackBar.show('Oops! The server is busy. Please try again later.', 'error');
                      //this.matSnackBar.show(`${error}`, 'warning');
                    }

                  this.form.get('email')?.setErrors({ invalid : true });
                  this.form.get('password')?.setErrors({ invalid : true });
                }
              })
            );
          }
        else
          {
            this.matSnackBar.show('Oops! You are offline. Check your internet connection.', 'error');
          }
      }
  }

  // Busca a existencia de pelo menos um trainer
  hasTrainerData(): boolean {
    const subDetail = this.trainerService.anyDetails().subscribe({
      next: (response) =>
      {
        //console.log(response)
        if (response == 0) { this.showAccount = true; }
        else { this.showAccount = false; }
      },
      error: (error) =>
      {
        this.showAccount = false;
        console.error('Error details:', error);
      },
    });
    this.subs.add(subDetail);
    return false;
  }

  createNewAccount()
  {
    const formData = new FormData();
    formData.append('FullName', 'Administrator');
    formData.append('Email', 'admin@gmail.com');
    formData.append('PhoneNumber', '12 345 6789');
    formData.append('Position', 'Admin');
    formData.append('Status', 'active');
    formData.append('Password', 'Administrator-2');

    if (this.selectedFile) {
      formData.append('profileImage', this.selectedFile);
    }

    ['Admin'].forEach(role => formData.append('Roles', role));

        // Chamada do serviço
    const subCreate = this.trainerService.create(formData).subscribe({
      next: () =>
      {
        this.showAccount = false;
        //console.log('Trainer created successfully!');
        this.matSnackBar.show('Administrator account created successfully!', 'success');
      },
      error: (error) =>
      {
        this.showAccount = false;
        console.error('Error details:', error);
      },
    });
    this.subs.add(subCreate);
  }

  migrateDb()
  {
    // Use forkJoin para operações paralelas
    this.subs.add(
      this.setupService.migrateDb().pipe(
        // 1. Criar role Admin
        switchMap(() => {
          const adminRole: RolesCreateDto = { roleName: "Admin" };
          return this.roleService.create(adminRole);
        }),

        // 2. Criar role User
        switchMap(() => {
          const userRole: RolesCreateDto = { roleName: "User" };
          return this.roleService.create(userRole);
        }),
        switchMap(() => forkJoin([
          this.settingService.createAcademicYear(),
          this.settingService.createAmountMt(),
          this.settingService.createMonthly()
        ])),
        // ...
      ).subscribe({
        next: () => {
          this.showMigration = false;
          //console.log('Migrations & Roles created successfully!');
        },
        error: (error) => {
          if (error.status === 400) {
            this.matSnackBar.show(error.error.Message, 'error');
          } else if (error.status === 401) {
            this.matSnackBar.show('Oops! Unauthorized!', 'error');
          } else if (error.status === 404) {
            this.matSnackBar.show('Oops! Not found!', 'error');
          } else if (error.status >= 500) {
            this.matSnackBar.show('Oops! The server is busy!', 'error');
          } else {
            this.matSnackBar.show('Oops! An unexpected error occurred.', 'error');
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
