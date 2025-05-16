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
import { StepperEnrollmentService } from '../../../../_services/stepper-enrollment.service';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, map, Observable, startWith, Subscription } from 'rxjs';
import { EnrollmentStudentService } from '../../../../_services/enrollment-student.service';

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
  private readonly stepperService = inject(StepperEnrollmentService);
  stateGroupOptions!: Observable<StateGroup[]>;
  statePlaceOfIssue!: Observable<StateGroup[]>;
  stateNationality!: Observable<StateGroup[]>;
  statePlaceOfBirth!: Observable<StateGroup[]>;
  stateGroupOptionsGuardian!: Observable<StateGroup[]>;
  private subs = new Subscription();

  form! : FormGroup;

  constructor (private dateAdapter: DateAdapter<Date>, private enrollmentStudentService: EnrollmentStudentService)
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
        'Aeroporto "A"',
        'Aeroporto "B"'
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
        'Central "A"',
        'Central "B"',
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
        'Cidade de Maputo',
        'Gaza',
        'Inhambane',
        'Manica',
        'Maputo Província',
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
        'Aeroporto "A"',
        'Aeroporto "B"'
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
        'Central "A"',
        'Central "B"',
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
    this.initializeForm();
    this.setupAddressSync();

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

  private setupAddressSync() {
    this.subs.add(
      this.form.get('residentialAddress')?.valueChanges
      .pipe(
        debounceTime(100), // Espera 300ms após a digitação
        distinctUntilChanged() // Só emite se o valor mudou
      )
      .subscribe(value => {
        this.form.get('guardianResidentialAddress')?.patchValue(value);
      })
    )
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

  clear()
  {
    this.alert.show('Form cleared successfully!', 'success');
  }

  @ViewChild('studentFormRef') formElement!: ElementRef<HTMLFormElement>;
  resetForm()
  {
    this.form.reset();
    this.formElement.nativeElement.reset();
  }

  update()
  {
    this.stepperService.setActiveStep(1);
    /*
    if (this.form.valid) {
      this.enrollmentStudentService.setEnrollmentStudent
      ({
        package: this.form.value.package,
        level: this.form.value.level,
        modality: this.form.value.modality,
        academicPeriod: this.form.value.academicPeriod,
        schedule: this.form.value.pickTime,

        documentType: this.form.value.documentType,
        idNumber: this.form.value.idNumber,
        placeOfIssue: this.capitalizeWords(this.form.value.placeOfIssue),
        expirationDate: this.formatDate(this.form.value.expirationDate),

        fullName: this.capitalizeWords(this.form.value.fullName),
        dateOfBirth: this.formatDate(this.form.value.dateOfBirth),
        gender: this.form.value.gender,
        maritalStatus: this.form.value.maritalStatus,
        nationality: this.capitalizeWords(this.form.value.nationality),
        placeOfBirth: this.capitalizeWords(this.form.value.placeOfBirth),
        residentialAddress: this.capitalizeWords(this.form.value.residentialAddress),
        phoneNumber: this.form.value.phoneNumber,
        emailAddress: this.form.value.emailAddress!.toLowerCase(),
        additionalNotes: this.form.value.additionalNotes,

        guardFullName: this.capitalizeWords(this.form.value.guardianFullName),
        guardRelationship: this.form.value.guardianRelationship,
        guardResidentialAddress: this.capitalizeWords(this.form.value.guardianResidentialAddress),
        guardPhoneNumber: this.form.value.guardianPhoneNumber,
        guardEmailAddress: this.form.value.guardianEmailAddress!.toLowerCase()
      });

      this.stepperService.setActiveStep(1);
    }
    */
  }
}
