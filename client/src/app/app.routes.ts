import { Routes } from '@angular/router';
import { RamComponent } from './_components/ram/ram.component';
import { DashboardComponent } from './_pages/dashboard/dashboard.component';
import { authGuard } from './_guards/auth.guard';
import { loginGuard } from './_guards/login.guard';
import { LoginComponent } from './_components/login/login.component';
import { EnrollmentComponent } from './_components/enrollment/enrollment.component';
import { PaymentComponent } from './_components/payment/payment.component';
import { StudentActiveComponent } from './_pages/Students/student-active/student-active.component';
import { StudentQuizzesExamesComponent } from './_pages/Students/student-active/student-quizzes-exames/student-quizzes-exames.component';
import { StudentScheduledExamsComponent } from './_pages/Students/student-scheduled-exams/student-scheduled-exams.component';
import { FinancialExpenseComponent } from './_pages/Financials/financial-expense/financial-expense.component';
import { FinancialDailyReportComponent } from './_pages/Financials/financial-daily-report/financial-daily-report.component';
import { LoginSigninComponent } from './_pages/login-signin/login-signin.component';

export const routes: Routes = [
    {
    path : 'login',
    component : LoginComponent,
    canActivate : [loginGuard],
    children : [
      {
        path : '',
        component : LoginSigninComponent,
        outlet: 'loginRouter'
      },
      {
        path : 'forgot-password',
        loadComponent: () =>
          import('./_pages/login-forgot-password/login-forgot-password.component').then(m => m.LoginForgotPasswordComponent),
        outlet : 'loginRouter'
      },
      {
        path : 'validate-reset-code',
        loadComponent: () =>
          import('./_pages/login-validate-code/login-validate-code.component').then(m => m.LoginValidateCodeComponent),
        outlet : 'loginRouter'
      },
      {
        path : 'reset-password',
        loadComponent: () =>
          import('./_pages/login-reset-password/login-reset-password.component').then(m => m.LoginResetPasswordComponent),
        outlet : 'loginRouter'
      },
      {
        path : 'ok',
        loadComponent: () =>
          import('./_pages/login-ok/login-ok.component').then(m => m.LoginOkComponent),
        outlet : 'loginRouter'
      }
    ]
  },
  {
    path : '',
    component : RamComponent,
    canActivate : [authGuard],
    children : [
      {
        path : 'profile',
        loadComponent: () =>
          import('./_pages/profile/profile.component').then(m => m.ProfileComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'system-access',
        loadComponent: () =>
          import('./_pages/system-access/system-access.component').then(m => m.SystemAccessComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'change-password',
        loadComponent: () =>
          import('./_components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'dashboard',
        component : DashboardComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'enrollments',
        component : EnrollmentComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'trainers',
        loadComponent: () =>
          import('./_components/trainers/trainers.component').then(m => m.TrainersComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'subsidy',
        loadComponent: () =>
          import('./_pages/Trainers/subsidy/subsidy.component').then(m => m.SubsidyComponent),
        outlet : 'ramRouter'
      }
      ,
      {
        path : 'payments',
        component : PaymentComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'student-active',
        component : StudentActiveComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'student-active-profile',
        loadComponent: () =>
          import('./_pages/Students/student-active/student-active-profile/student-active-profile.component').then(m => m.StudentActiveProfileComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'student-edit-personal-data',
        loadComponent : () =>
          import('./_pages/Students/student-active/student-edit-personal-data/student-edit-personal-data.component').then(s => s.StudentEditPersonalDataComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'student-view-enrollment-form',
        loadComponent : () =>
          import('./_pages/Students/student-active/student-view-enrollment-form/student-view-enrollment-form.component').then(s => s.StudentViewEnrollmentFormComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'student-active-quizzes-exams',
        component : StudentQuizzesExamesComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'student-quizzes-exams-details',
        loadComponent : () =>
          import('./_pages/Students/student-active/student-quizzes-exam-detail/student-quizzes-exam-detail.component').then(s => s.StudentQuizzesExamDetailComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'student-progress-management',
        loadComponent: () =>
          import('./_pages/Students/student-active/student-progress-management/student-progress-management.component').then(s => s.StudentProgressManagementComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'student-scheduled-exams',
        component : StudentScheduledExamsComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'student-finished',
        loadComponent: () =>
          import('./_pages/Students/student-finished/student-finished.component').then(m => m.StudentFinishedComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'student-dropouts',
        loadComponent: () =>
          import('./_pages/Students/student-dropouts/student-dropouts.component').then(m => m.StudentDropoutsComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'financial-expense',
        component : FinancialExpenseComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'financial-revenue',
        loadComponent: () =>
          import('./_pages/Financials/financial-revenue/financial-revenue.component').then(m => m.FinancialRevenueComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'financial-tuition',
        loadComponent: () =>
          import('./_pages/Financials/financial-tuition/financial-tuition.component').then(m => m.FinancialTuitionComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'financial-cash-flow',
        loadComponent: () =>
          import('./_pages/Financials/financial-cash-flow/financial-cash-flow.component').then(m => m.FinancialCashFlowComponent),
        outlet : 'ramRouter'
      },
      {
        path : 'financial-daily-report',
        component : FinancialDailyReportComponent,
        outlet : 'ramRouter'
      },
      {
        path : 'settings',
        loadComponent: () =>
          import('./_pages/settings/settings.component').then(m => m.SettingsComponent),
        outlet : 'ramRouter'
      }
    ]
  },
  {
    path : '**',
    redirectTo : 'login'
  }
];
