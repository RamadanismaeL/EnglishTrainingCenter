import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TitleNavbarService } from '../../_services/title-navbar.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ram-left',
  imports: [
    MatIconModule,
    MatCardModule,
    CommonModule,
    RouterLink,
    RouterModule,
    MatTooltipModule
  ],
  templateUrl: './ram-left.component.html',
  styleUrl: './ram-left.component.scss'
})
export class RamLeftComponent implements OnInit, OnDestroy {
  @Input() collapsed: boolean = false;
  isOpen = false;
  isOpenFinancial = false;

  // Nav Title
  isTitleRoute = false;

  private subs = new Subscription();

  // Students
  student : boolean = false;
  studentActive : boolean = false;
  studentScheduledExams : boolean = false;
  studentFinished : boolean = false;
  studentDropout : boolean = false;

  // Trainers
  trainer : boolean = false;

  // Financials
  financial : boolean = false;
  financialExpense : boolean = false;
  financialRevenue : boolean = false;
  financialTuition : boolean = false;
  financialCashFlow : boolean = false;
  financialDailyReport : boolean = false;

  constructor(private router: Router, private titleNavbarService: TitleNavbarService) {}

  navigateTo (breadcrumbs: { label: string, url?: any[] }[]) {
    this.titleNavbarService.setBreadcrumbs(breadcrumbs);
  }

  ngOnInit(): void {
    // Update state on route changes
    this.checkIfFinancialRoute(this.router.url);
    this.checkIfStudentRoute(this.router.url);
    this.checkIfTrainerRoute(this.router.url);

    this.subs.add(
      this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        //this.updateActiveState();

        const currentUrl = this.router.url;

        // Se o outlet ramRouter estiver em 'student-active', ativa o boolean
        //this.student = currentUrl.includes('student-active');

        // Student
        if
        (
          (currentUrl === ('/(ramRouter:student-active)')) ||
          (currentUrl === ('/(ramRouter:student-scheduled-exams)')) ||
          (currentUrl === ('/(ramRouter:student-finished)')) ||
          (currentUrl === ('/(ramRouter:student-dropouts)')) ||
          (currentUrl === ('/(ramRouter:student-active-quizzes-exams)')) ||
          (currentUrl === ('/(ramRouter:student-active-profile)')) ||
          (currentUrl === ('/(ramRouter:student-progress-management)')) ||
          (currentUrl === ('/(ramRouter:student-edit-personal-data)')) ||
          (currentUrl === ('/(ramRouter:student-view-enrollment-form)')) ||
          (currentUrl === ('/(ramRouter:student-quizzes-exams-details)')) ||
          (currentUrl === ('/(ramRouter:student-manage-status)')) ||
          (currentUrl === ('/(ramRouter:student-finished-manage-evaluations)')) ||
          (currentUrl === ('/(ramRouter:student-finished-manage-status)')) ||
          (currentUrl === ('/(ramRouter:student-finished-manage-evaluations-details)'))  ||
          (currentUrl === ('/(ramRouter:student-finished-profile)')) ||
          (currentUrl === ('/(ramRouter:student-finished-edit-personal-data)')) ||
          (currentUrl === ('/(ramRouter:student-finished-enrollment-form)'))
        )
        {
          this.student = true;
        }
        else
        {
          this.student = false;
        }

        if ((currentUrl === ('/(ramRouter:student-active)')) ||
          (currentUrl === ('/(ramRouter:student-active-quizzes-exams)')) ||
          (currentUrl === ('/(ramRouter:student-active-profile)')) ||
          (currentUrl === ('/(ramRouter:student-progress-management)')) ||
          (currentUrl === ('/(ramRouter:student-edit-personal-data)')) ||
          (currentUrl === ('/(ramRouter:student-view-enrollment-form)')) ||
          (currentUrl === ('/(ramRouter:student-quizzes-exams-details)')) ||
          (currentUrl === ('/(ramRouter:student-manage-status)'))
        )
        {
          this.studentActive = true;
        }
        else
        {
          this.studentActive = false;
        }

        if (currentUrl === ('/(ramRouter:student-scheduled-exams)'))
        {
          this.studentScheduledExams = true;
        }
        else
        {
          this.studentScheduledExams = false;
        }

        if (currentUrl === ('/(ramRouter:student-finished)') ||
          (currentUrl === ('/(ramRouter:student-finished-manage-evaluations)')) ||
          (currentUrl === ('/(ramRouter:student-finished-manage-status)')) ||
          (currentUrl === ('/(ramRouter:student-finished-manage-evaluations-details)')) ||
          (currentUrl === ('/(ramRouter:student-finished-profile)')) ||
          (currentUrl === ('/(ramRouter:student-finished-edit-personal-data)')) ||
          (currentUrl === ('/(ramRouter:student-finished-enrollment-form)'))
        )
        {
          this.studentFinished = true;
        }
        else
        {
          this.studentFinished = false;
        }

        if (currentUrl === ('/(ramRouter:student-dropouts)'))
        {
          this.studentDropout = true;
        }
        else
        {
          this.studentDropout = false;
        }


        // Trainers this.isTrainerOrSubsidyActive = savedRoute === 'trainers' || savedRoute === 'subsidy';
        if ((currentUrl === '/(ramRouter:trainers)') ||
        (currentUrl === '/(ramRouter:subsidy)')
        )
        { this.trainer = true; }
        else
        { this.trainer = false; }


        // Financials
        if ((currentUrl === ('/(ramRouter:financial-expense)')) ||
        (currentUrl === ('/(ramRouter:financial-revenue)')) ||
        (currentUrl === ('/(ramRouter:financial-tuition)')) ||
        (currentUrl === ('/(ramRouter:financial-cash-flow)')) ||
        (currentUrl === ('/(ramRouter:financial-daily-report)'))
        )
        {
          this.financial = true;
        }
        else
        {
          this.financial = false;
        }

        if (currentUrl === ('/(ramRouter:financial-expense)'))
        {
          this.financialExpense = true;
        }
        else
        {
          this.financialExpense = false;
        }

        if (currentUrl === ('/(ramRouter:financial-revenue)'))
        {
          this.financialRevenue = true;
        }
        else
        {
          this.financialRevenue = false;
        }

        if (currentUrl === ('/(ramRouter:financial-tuition)'))
        {
          this.financialTuition = true;
        }
        else
        {
          this.financialTuition = false;
        }

        if (currentUrl === ('/(ramRouter:financial-cash-flow)'))
        {
          this.financialCashFlow = true;
        }
        else
        {
          this.financialCashFlow = false;
        }

        if (currentUrl === ('/(ramRouter:financial-daily-report)'))
        {
          this.financialDailyReport = true;
        }
        else
        {
          this.financialDailyReport = false;
        }
      })
    );

    // Initialize from sessionStorage on page load
    //this.loadActiveStateFromStorage();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  togglePanelFinancial() {
    this.isOpenFinancial = !this.isOpenFinancial;
  }

  private checkIfStudentRoute(currentUrl: string): void {
    if
    (
      (currentUrl === ('/(ramRouter:student-active)')) ||
      (currentUrl === ('/(ramRouter:student-scheduled-exams)')) ||
      (currentUrl === ('/(ramRouter:student-finished)')) ||
      (currentUrl === ('/(ramRouter:student-dropouts)')) ||
      (currentUrl === ('/(ramRouter:student-active-quizzes-exams)')) ||
      (currentUrl === ('/(ramRouter:student-active-profile)')) ||
      (currentUrl === ('/(ramRouter:student-progress-management)')) ||
      (currentUrl === ('/(ramRouter:student-edit-personal-data)')) ||
      (currentUrl === ('/(ramRouter:student-view-enrollment-form)')) ||
      (currentUrl === ('/(ramRouter:student-quizzes-exams-details)')) ||
          (currentUrl === ('/(ramRouter:student-manage-status)')) ||
      (currentUrl === ('/(ramRouter:student-finished-manage-evaluations)')) ||
      (currentUrl === ('/(ramRouter:student-finished-manage-status)')) ||
      (currentUrl === ('/(ramRouter:student-finished-manage-evaluations-details)')) ||
      (currentUrl === ('/(ramRouter:student-finished-profile)')) ||
      (currentUrl === ('/(ramRouter:student-finished-edit-personal-data)')) ||
      (currentUrl === ('/(ramRouter:student-finished-enrollment-form)'))
    )
    {
      this.student = true;
    }
    else
    {
        this.student = false;
    }

    if ((currentUrl === ('/(ramRouter:student-active)')) ||
      (currentUrl === ('/(ramRouter:student-active-quizzes-exams)')) ||
      (currentUrl === ('/(ramRouter:student-active-profile)')) ||
      (currentUrl === ('/(ramRouter:student-progress-management)')) ||
      (currentUrl === ('/(ramRouter:student-edit-personal-data)')) ||
      (currentUrl === ('/(ramRouter:student-view-enrollment-form)')) ||
      (currentUrl === ('/(ramRouter:student-quizzes-exams-details)')) ||
      (currentUrl === ('/(ramRouter:student-manage-status)'))
    )
    {
      this.studentActive = true;
    }
    else
    {
      this.studentActive = false;
    }

    if (currentUrl === ('/(ramRouter:student-scheduled-exams)'))
    {
      this.studentScheduledExams = true;
    }
    else
    {
      this.studentScheduledExams = false;
    }

    if (currentUrl === ('/(ramRouter:student-finished)') ||
      (currentUrl === ('/(ramRouter:student-finished-manage-evaluations)')) ||
      (currentUrl === ('/(ramRouter:student-finished-manage-status)')) ||
      (currentUrl === ('/(ramRouter:student-finished-manage-evaluations-details)')) ||
      (currentUrl === ('/(ramRouter:student-finished-profile)')) ||
      (currentUrl === ('/(ramRouter:student-finished-edit-personal-data)')) ||
      (currentUrl === ('/(ramRouter:student-finished-enrollment-form)'))
    )
    {
      this.studentFinished = true;
    }
    else
    {
      this.studentFinished = false;
    }

    if (currentUrl === ('/(ramRouter:student-dropouts)'))
    {
      this.studentDropout = true;
    }
    else
    {
      this.studentDropout = false;
    }
  }

  private checkIfFinancialRoute(currentUrl: string): void {
    if ((currentUrl === ('/(ramRouter:financial-expense)')) ||
        (currentUrl === ('/(ramRouter:financial-revenue)')) ||
        (currentUrl === ('/(ramRouter:financial-tuition)')) ||
        (currentUrl === ('/(ramRouter:financial-cash-flow)')) ||
        (currentUrl === ('/(ramRouter:financial-daily-report)'))
        )
        {
          this.financial = true;
        }
        else
        {
          this.financial = false;
        }

        if (currentUrl === ('/(ramRouter:financial-expense)'))
        {
          this.financialExpense = true;
        }
        else
        {
          this.financialExpense = false;
        }

        if (currentUrl === ('/(ramRouter:financial-revenue)'))
        {
          this.financialRevenue = true;
        }
        else
        {
          this.financialRevenue = false;
        }

        if (currentUrl === ('/(ramRouter:financial-tuition)'))
        {
          this.financialTuition = true;
        }
        else
        {
          this.financialTuition = false;
        }

        if (currentUrl === ('/(ramRouter:financial-cash-flow)'))
        {
          this.financialCashFlow = true;
        }
        else
        {
          this.financialCashFlow = false;
        }

        if (currentUrl === ('/(ramRouter:financial-daily-report)'))
        {
          this.financialDailyReport = true;
        }
        else
        {
          this.financialDailyReport = false;
        }
  }

  private checkIfTrainerRoute(currentUrl: string): void {
    if ((currentUrl === '/(ramRouter:trainers)') ||
        (currentUrl === '/(ramRouter:subsidy)')
        )
        { this.trainer = true; }
        else
        { this.trainer = false; }
  }
}
