import { Component, Inject, inject, OnDestroy, OnInit, } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule, TooltipPosition } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { DialogTrainerUpdateComponent } from '../../../_components/dialog-trainer-update/dialog-trainer-update.component';
import { SnackBarService } from '../../../_services/snack-bar.service';
import { StudentShareIdService } from '../../../_services/student-share-id.service';
import { StudentCourseInfoUpdateDto } from '../../../_interfaces/student-course-info-update-dto';
import { StudentCourseInfoService } from '../../../_services/student-course-info.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dialog-update-student-course-info',
  imports: [
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './dialog-update-student-course-info.component.html',
  styleUrl: './dialog-update-student-course-info.component.scss'
})
export class DialogUpdateStudentCourseInfoComponent implements OnInit, OnDestroy {
  positionOptions: TooltipPosition[] = ['below', 'above', 'left', 'right'];
  position = new FormControl(this.positionOptions[0]);

  private readonly alert = inject(SnackBarService);

  form! : FormGroup;
  private readonly fb = inject(FormBuilder);
  private subs: Subscription = new Subscription();

  private courseInfoUpdate: StudentCourseInfoUpdateDto =
  {
    studentId: '',
    package: '',
    modality: '',
    academicPeriod: '',
    schedule: ''
  };

  constructor(public dialogRef : MatDialogRef<DialogTrainerUpdateComponent>, @Inject(MAT_DIALOG_DATA) public data: {package: string, modality: string, academicPeriod: string, schedule: string}, private studentShareId: StudentShareIdService, private courseInfoService: StudentCourseInfoService)
  {
    //console.log('Dados recebidos: ',data,' Student ID: ', this.studentShareId.currentEnrollment);
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      package : ['', [Validators.required, Validators.nullValidator]],
      modality : ['', [Validators.required, Validators.nullValidator]],
      academicPeriod : ['', [Validators.required, Validators.nullValidator]],
      pickTime : ['', [Validators.required, Validators.nullValidator]]
    });

    if (this.data)
    {
      this.form.patchValue
      ({
        package : this.data.package,
        modality : this.data.modality,
        academicPeriod : this.data.academicPeriod,
        pickTime : this.data.schedule
      });
    }
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  onCancel()
  {
    this.dialogRef.close(false);
  }

  update() {
    if (this.form.valid)
    {
      this.courseInfoUpdate.studentId = this.studentShareId.currentEnrollment;
      this.courseInfoUpdate.package = this.form.value.package;
      this.courseInfoUpdate.modality = this.form.value.modality;
      this.courseInfoUpdate.academicPeriod = this.form.value.academicPeriod;
      this.courseInfoUpdate.schedule = this.form.value.pickTime;
      //console.log('Dados a enviar: ', this.courseInfoUpdate);

      this.subs.add(
        this.courseInfoService.update(this.courseInfoUpdate).subscribe({
          next: () => {
            this.alert.show('Course updated successfully!', 'success');
            this.dialogRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 400) {
                this.alert.show('An error occurred while updating.', 'error');
            } else if (error.status === 401) {
                this.alert.show('Oops! Unauthorized!', 'error');
            } else if (error.status === 404) {
                this.alert.show('Oops! Not found!', 'error');
            } else if (error.status >= 500) {
                this.alert.show('Oops! The server is busy!', 'error');
            } else {
                this.alert.show('Oops! An unexpected error occurred.', 'error');
            }
            this.dialogRef.close(false);
          }
        })
      );
    }
  }
}
