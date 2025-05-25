import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { TitleNavbarService } from '../../../../_services/title-navbar.service';
import { StudentShareIdService } from '../../../../_services/student-share-id.service';
import { StudentsService } from '../../../../_services/students.service';
import { Observable } from 'rxjs';
import { StudentListProfileDto } from '../../../../_interfaces/student-list-profile-dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-active-profile',
  imports: [
    MatMenuModule,
    MatIconModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './student-active-profile.component.html',
  styleUrl: './student-active-profile.component.scss'
})
export class StudentActiveProfileComponent implements OnInit {
  profileDetail$!: Observable<StudentListProfileDto>;
  sutdentId : string | undefined = ""

  constructor(private titleNavbarService: TitleNavbarService, private studentShareId: StudentShareIdService, private studentService: StudentsService)
  {}

  ngOnInit(): void {
    //console.log("Student id = ",this.studentShareId.currentEnrollment)
    this.sutdentId = this.studentShareId.currentEnrollment;
    this.profileDetail$ = this.studentService.getStudentListProfileById(this.studentShareId.currentEnrollment);
  }

  navigateTo (breadcrumbs: { label: string, url?: any[] }) {
    this.titleNavbarService.addBreadcrumb(breadcrumbs);
  }
}
