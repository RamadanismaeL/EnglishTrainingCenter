import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
//import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule } from '@angular/material/core';
import { NgxMaskDirective } from 'ngx-mask';
import { SnackBarService } from '../../../../_services/snack-bar.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subscription } from 'rxjs';
import { StudentShareIdService } from '../../../../_services/student-share-id.service';
import { StudentsService } from '../../../../_services/students.service';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentEditPersonalDataService } from '../../../../_services/student-edit-personal-data.service';
import { NotificationHubService } from '../../../../_services/notification-hub.service';

export interface StateGroup {
  letter: string;
  names: string[];
}

export const _filter = (opt: string[], value: string): string[] => {
  const filterValue = value.toLowerCase();

  return opt.filter(item => item.toLowerCase().includes(filterValue));
};

@Component({
  selector: 'app-student-edit-personal-data',
  imports: [
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMaskDirective,
    ReactiveFormsModule,
    MatAutocompleteModule,
    AsyncPipe,
    FormsModule
  ],
  templateUrl: './student-edit-personal-data.component.html',
  styleUrl: './student-edit-personal-data.component.scss'
})
export class StudentEditPersonalDataComponent implements OnInit, OnDestroy {
  expirationDate: DateAdapter<Date, any>;
  private readonly alert = inject(SnackBarService);
  private readonly fb = inject(FormBuilder);
  stateGroupOptions!: Observable<StateGroup[]>;
  statePlaceOfIssue!: Observable<StateGroup[]>;
  stateNationality!: Observable<StateGroup[]>;
  statePlaceOfBirth!: Observable<StateGroup[]>;
  stateGroupOptionsGuardian!: Observable<StateGroup[]>;
  private subs = new Subscription();
  orderStudent : number | undefined;

  form! : FormGroup;

  constructor (private dateAdapter: DateAdapter<Date>, private studentShareId: StudentShareIdService, private studentService: StudentsService, private studentEditPersonal: StudentEditPersonalDataService, private notificationHub: NotificationHubService)
  {
    this.dateAdapter.setLocale('en-GB'); // Use 'en-GB' for dd/mm/yyyy format
    this.expirationDate = this.dateAdapter;
  }

  residentialAddress: StateGroup[] = [
    {
      letter: 'A',
      names:
      [
        'Albazine',
        'Alto Maé',
        'Aeroporto A',
        'Aeroporto B'
      ],
    },
    {
      letter: 'B',
      names:
      [
        'Bagamoyo',
        'Bairro dos Pescadores',
        'Bairro T3',
        'Benfica',
        'Belo Horizonte',
        'Boane',
        'Bunhiça'
      ],
    },
    {
      letter: 'C',
      names:
      [
        'Central A',
        'Central B',
        'Chamanculo',
        'Coop',
        'Costa do Sol'
      ],
    },
    {
      letter: 'F',
      names:
      [
        'Ferroviário',
        'Fomento',
        '3 de Fevereiro'
      ],
    },
    {
      letter: 'H',
      names: ['Hulene'],
    },
    {
      letter: 'K',
      names:
      [
        'Kamavota',
        'Kampfumo',
        'Katembe',
        'Kilometro 15'
      ],
    },
    {
      letter: 'L',
      names:
      [
        'Laulane',
        'Liberdade',
        'Luzalite'
      ],
    },
    {
      letter: 'M',
      names: [
        'Machava',
        'Machava Bedene',
        'Machava Sede',
        'Mafalala',
        'Magoanine',
        'Malhampsene',
        'Malhazine',
        'Matola-Gare',
        'Mavalane',
        'Maxaquene'
      ],
    },
    {
      letter: 'N',
      names: [
        'Nkobe',
        'Nlhamankulu'
      ],
    },
    {
      letter: 'P',
      names:
      [
        'Patrice Lumumba',
        'Polana Caniço'
      ],
    },
    {
      letter: 'S',
      names: ['Sommerschield'],
    },
    {
      letter: 'T',
      names:
      [
        'Tsalala',
        'Triunfo',
        'Txumene'
      ],
    },
    {
      letter: 'X',
      names:
      [
        'Xipamanine',
        'Xiquelene'
      ],
    },
    {
      letter: 'Z',
      names:
      [
        'Zona Verde',
        'Zona Industrial',
        'Zimpeto'
      ],
    },
  ];

  placeOfIssue: StateGroup[] = [
    {
      letter: '',
      names:
      [
        'Cidade de Maputo',
        'Cidade da Matola'
      ],
    }
  ];

  nationality: StateGroup[] = [
    {
      letter: '',
      names:
      [
        'Moçambicana'
      ],
    }
  ];

  placeOfBirth: StateGroup[] = [
    {
      letter: '',
      names:
      [
        'Cabo Delgado',
        'Gaza',
        'Inhambane',
        'Manica',
        'Maputo',
        'Nampula',
        'Niassa',
        'Sofala',
        'Tete',
        'Zambézia'
      ],
    }
  ];

  guardianResidentialAddress: StateGroup[] = [
    {
      letter: 'A',
      names:
      [
        'Albazine',
        'Alto Maé',
        'Aeroporto A',
        'Aeroporto B'
      ],
    },
    {
      letter: 'B',
      names:
      [
        'Bagamoyo',
        'Bairro dos Pescadores',
        'Bairro T3',
        'Benfica',
        'Belo Horizonte',
        'Boane',
        'Bunhiça'
      ],
    },
    {
      letter: 'C',
      names:
      [
        'Central A',
        'Central B',
        'Chamanculo',
        'Coop',
        'Costa do Sol'
      ],
    },
    {
      letter: 'F',
      names:
      [
        'Ferroviário',
        'Fomento',
        '3 de Fevereiro'
      ],
    },
    {
      letter: 'H',
      names: ['Hulene'],
    },
    {
      letter: 'K',
      names:
      [
        'Kamavota',
        'Kampfumo',
        'Katembe',
        'Kilometro 15'
      ],
    },
    {
      letter: 'L',
      names:
      [
        'Laulane',
        'Liberdade',
        'Luzalite'
      ],
    },
    {
      letter: 'M',
      names: [
        'Machava',
        'Machava Bedene',
        'Machava Sede',
        'Mafalala',
        'Magoanine',
        'Malhampsene',
        'Malhazine',
        'Matola-Gare',
        'Mavalane',
        'Maxaquene'
      ],
    },
    {
      letter: 'N',
      names: [
        'Nkobe',
        'Nlhamankulu'
      ],
    },
    {
      letter: 'P',
      names:
      [
        'Patrice Lumumba',
        'Polana Caniço'
      ],
    },
    {
      letter: 'S',
      names: ['Sommerschield'],
    },
    {
      letter: 'T',
      names:
      [
        'Tsalala',
        'Triunfo',
        'Txumene'
      ],
    },
    {
      letter: 'X',
      names:
      [
        'Xipamanine',
        'Xiquelene'
      ],
    },
    {
      letter: 'Z',
      names:
      [
        'Zona Verde',
        'Zona Industrial',
        'Zimpeto'
      ],
    },
  ];

  ngOnInit(): void {
    this.loderDetail();
    this.initializeForm();

    this.stateGroupOptions = this.form.get('residentialAddress')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroup(value || '')),
    );

    this.statePlaceOfIssue = this.form.get('placeOfIssue')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroupPlaceOfIssue(value || '')),
    );

    this.stateNationality = this.form.get('nationality')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroupNationality(value || '')),
    );

    this.statePlaceOfBirth = this.form.get('placeOfBirth')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroupPlaceOfBirth(value || '')),
    );

    this.stateGroupOptionsGuardian = this.form.get('guardianResidentialAddress')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterGroupGuardian(value || '')),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private initializeForm() : void {
    this.form = this.fb.group({
      documentType : ['', [Validators.required, Validators.nullValidator]],
      idNumber : ['', [Validators.required, Validators.nullValidator]],
      placeOfIssue : ['', [Validators.required, Validators.nullValidator]],
      expirationDate : [''],


      fullName : ['', [Validators.required, Validators.nullValidator]],
      dateOfBirth : ['', [Validators.required, Validators.nullValidator]],
      gender : ['', [Validators.required, Validators.nullValidator]],
      maritalStatus : ['', [Validators.required, Validators.nullValidator]],
      nationality : ['', [Validators.required, Validators.nullValidator]],
      placeOfBirth : ['', [Validators.required, Validators.nullValidator]],
      residentialAddress : ['', [Validators.required, Validators.nullValidator]],
      primaryPhoneNumber : [''],
      alternativePhoneNumber : [''],
      emailAddress : [''],
      additionalNotes : [''],

      guardianFullName : [''],
      guardianRelationship : [''],
      guardianResidentialAddress : [''],
      guardianPrimaryPhoneNumber : [''],
      guardianAlternativePhoneNumber : [''],
      guardianEmailAddress : ['']
    });
  }

  private loderDetail()
  {
    this.subs.add(
      this.studentService.GetStudentListProfileEditById(this.studentShareId.currentEnrollment).subscribe({
        next: (response) =>
          {
            this.orderStudent = response.order
            this.form.patchValue
            ({
              documentType : response.documentType,
              idNumber : response.idNumber,
              placeOfIssue : response.placeOfIssue,
              expirationDate : this.parseDate(response.expirationDate),

              fullName : response.fullName,
              dateOfBirth : this.parseDate(response.dateOfBirth),
              gender : response.gender,
              maritalStatus : response.maritalStatus,
              nationality : response.nationality,
              placeOfBirth : response.placeOfBirth,
              residentialAddress : response.residentialAddress,
              primaryPhoneNumber : response.firstPhoneNumber,
              alternativePhoneNumber  : response.secondPhoneNumber,
              emailAddress : response.emailAddress,
              additionalNotes : response.additionalNotes,

              guardianFullName : response.guardFullName,
              guardianRelationship : response.guardRelationship,
              guardianResidentialAddress : response.guardResidentialAddress,
              guardianPrimaryPhoneNumber : response.guardFirstPhoneNumber,
              guardianAlternativePhoneNumber : response.guardSecondPhoneNumber,
              guardianEmailAddress : response.guardEmailAddress
            });
          },
        error: (error) =>
          {
            console.error("Erro no processo:", error);
            this.handleError(error);
          }
      })
    );
  }

  private _filterGroup(value: string): StateGroup[] {
    if (value) {
      return this.residentialAddress
        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
        .filter(group => group.names.length > 0);
    }

    return this.residentialAddress;
  }

  private _filterGroupPlaceOfIssue(value: string): StateGroup[] {
    if (value) {
      return this.placeOfIssue
        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
        .filter(group => group.names.length > 0);
    }

    return this.placeOfIssue;
  }

  private _filterGroupNationality(value: string): StateGroup[] {
    if (value) {
      return this.nationality
        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
        .filter(group => group.names.length > 0);
    }

    return this.nationality;
  }

  private _filterGroupPlaceOfBirth(value: string): StateGroup[] {
    if (value) {
      return this.placeOfBirth
        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
        .filter(group => group.names.length > 0);
    }

    return this.placeOfBirth;
  }

  private _filterGroupGuardian(value: string): StateGroup[] {
    if (value) {
      return this.guardianResidentialAddress
        .map(group => ({letter: group.letter, names: _filter(group.names, value)}))
        .filter(group => group.names.length > 0);
    }

    return this.guardianResidentialAddress;
  }

  getErrorForms(controlName: string)
  {
    return this.form.get(controlName);
  }

  private capitalizeWords(value: string | null): string {
    if (value === null) return '';

    return value
      .toLowerCase()
      .split(' ')
      .map(word =>
        word.length > 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : ''
      )
      .join(' ');
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;

    const [day, month, year] = dateStr.split('/').map(Number);

    if (
      isNaN(day) || isNaN(month) || isNaN(year) ||
      day < 1 || day > 31 ||
      month < 1 || month > 12
    ) {
      return null;
    }

    // Lembre-se: mês em JavaScript começa em 0 (Janeiro = 0)
    return new Date(year, month - 1, day);
  }

  update()
  {
    if (this.form.valid) {
      this.studentEditPersonal.setEnrollmentStudent
      ({
        order: this.orderStudent,

        documentType: this.form.value.documentType,
        idNumber: this.form.value.idNumber,
        placeOfIssue: this.capitalizeWords(this.form.value.placeOfIssue),
        expirationDate: this.formatDate(this.form.value.expirationDate),

        fullName: this.capitalizeWords(this.form.value.fullName),
        dateOfBirth: this.formatDate(this.form.value.dateOfBirth),
        dateOfBirthCalc: this.form.value.dateOfBirth,
        gender: this.form.value.gender,
        maritalStatus: this.form.value.maritalStatus,
        nationality: this.capitalizeWords(this.form.value.nationality),
        placeOfBirth: this.capitalizeWords(this.form.value.placeOfBirth),
        residentialAddress: this.capitalizeWords(this.form.value.residentialAddress),
        firstPhoneNumber: this.form.value.primaryPhoneNumber,
        secondPhoneNumber: this.form.value.alternativePhoneNumber,
        emailAddress: this.form.value.emailAddress.toLowerCase(),
        additionalNotes: this.form.value.additionalNotes,

        guardFullName: this.capitalizeWords(this.form.value.guardianFullName),
        guardRelationship: this.form.value.guardianRelationship,
        guardResidentialAddress: this.capitalizeWords(this.form.value.guardianResidentialAddress),
        guardFirstPhoneNumber: this.form.value.guardianPrimaryPhoneNumber,
        guardSecondPhoneNumber: this.form.value.guardianAlternativePhoneNumber,
        guardEmailAddress: this.form.value.guardianEmailAddress.toLowerCase()
      });

      this.subs.add(
        this.studentService.update(this.studentEditPersonal.currentEnrollment).subscribe({
          next: () => {
            this.alert.show('Student updated successfully!', 'success');
            this.notificationHub.sendMessage("Initialize enrollment form.");
          },
          error: (error) => {
            console.error("Erro no processo:", error);
            this.handleError(error);
          }
        })
      );
    }
  }

  private handleError(error: HttpErrorResponse)
  {
    if (error.status === 400) {
      this.alert.show('An error occurred.', 'error');
    } else if (error.status === 401) {
      this.alert.show('Oops! Unauthorized!', 'error');
    } else if (error.status === 404) {
      this.alert.show('Oops! Not found!', 'error');
    } else if (error.status >= 500) {
      this.alert.show('Oops! The server is busy!', 'error');
    } else {
      this.alert.show('Oops! An unexpected error occurred.', 'error');
    }
  }
}
