import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ScheduledExamComponent } from '../../../_components/Students/student-scheduled-exams/scheduled-exam/scheduled-exam.component';
import { UnScheduledExamComponent } from "../../../_components/Students/student-scheduled-exams/un-scheduled-exam/un-scheduled-exam.component";

@Component({
  selector: 'app-student-scheduled-exams',
  imports: [
    MatTabsModule,
    ScheduledExamComponent,
    UnScheduledExamComponent
],
  templateUrl: './student-scheduled-exams.component.html',
  styleUrl: './student-scheduled-exams.component.scss'
})
export class StudentScheduledExamsComponent
{}
