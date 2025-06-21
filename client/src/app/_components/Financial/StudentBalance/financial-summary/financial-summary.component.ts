import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { StudentShareIdService } from '../../../../_services/student-share-id.service';
import { StudentsService } from '../../../../_services/students.service';
import { Observable, Subscription } from 'rxjs';
import { StudentListProfileDto } from '../../../../_interfaces/student-list-profile-dto';
import { CommonModule } from '@angular/common';
import { NotificationHubService } from '../../../../_services/notification-hub.service';
import { TransactionFinancialSummaryComponent } from "../transaction-financial-summary/transaction-financial-summary.component";
import { ListTotalTransactionsStudentBalance } from '../../../../_interfaces/list-total-transactions-student-balance';

@Component({
  selector: 'app-financial-summary',
  imports: [
    MatMenuModule,
    MatIconModule,
    CommonModule,
    TransactionFinancialSummaryComponent
],
  templateUrl: './financial-summary.component.html',
  styleUrl: './financial-summary.component.scss'
})
export class FinancialSummaryComponent implements OnInit, OnDestroy {
  profileDetail$!: Observable<StudentListProfileDto>;
  sutdentId : string | undefined = "";
  totalTransactions$!: Observable<ListTotalTransactionsStudentBalance>;

  private subs = new Subscription();

  constructor(private titleNavbarService: TitleNavbarService, private studentShareId: StudentShareIdService, private studentService: StudentsService, private notificationHub: NotificationHubService)
  {}

  ngOnInit(): void {
    this.subs.add(
      this.notificationHub.receiveMessage().subscribe(() => {
        this.profileDetail$ = this.studentService.getStudentListProfileById(this.studentShareId.currentEnrollment);
        this.totalTransactions$ = this.studentService.getTotalTransactionsByStudentId(this.studentShareId.currentEnrollment);
      })
    );
    //console.log("Student id = ",this.studentShareId.currentEnrollment)
    this.sutdentId = this.studentShareId.currentEnrollment;
    this.profileDetail$ = this.studentService.getStudentListProfileById(this.studentShareId.currentEnrollment);
    this.totalTransactions$ = this.studentService.getTotalTransactionsByStudentId(this.studentShareId.currentEnrollment);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);
  }

  formatAmount(value: number | undefined | string): string {
    if (value === null || value === undefined || value === '') return '';

    let numberValue: number;

    if (typeof value === 'string') {
      const cleanedValue = value.replace(/\./g, '').replace(',', '.');
      numberValue = parseFloat(cleanedValue);
    } else {
      numberValue = value;
    }

    if (isNaN(numberValue)) return '';

    // Formatação manual com regex
    return numberValue.toFixed(2)
      .replace('.', ',') // Substitui ponto decimal por vírgula
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona pontos nos milhares
  }
}
