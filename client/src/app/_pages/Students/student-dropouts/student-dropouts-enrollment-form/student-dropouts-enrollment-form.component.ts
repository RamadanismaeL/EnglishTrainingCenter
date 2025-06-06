import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StudentListProfileEnrollmentDto } from '../../../../_interfaces/student-list-profile-enrollment-dto';
import { StudentShareIdService } from '../../../../_services/student-share-id.service';
import { StudentsService } from '../../../../_services/students.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-student-dropouts-enrollment-form',
  imports: [ CommonModule ],
  templateUrl: './student-dropouts-enrollment-form.component.html',
  styleUrl: './student-dropouts-enrollment-form.component.scss'
})
export class StudentDropoutsEnrollmentFormComponent implements OnInit {
  profileDetail$!: Observable<StudentListProfileEnrollmentDto>;
  sutdentId : string | undefined = "";

  constructor(private studentShareId: StudentShareIdService, private studentService: StudentsService)
  {}

  ngOnInit(): void {
    //console.log("Student id = ",this.studentShareId.currentEnrollment)
    this.sutdentId = this.studentShareId.currentEnrollment;
    this.profileDetail$ = this.studentService.getStudentListProfileEnrollmentById(this.studentShareId.currentEnrollment);
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

  getTimeFromDate(input: Date): string
  {
    const date = typeof input === 'string' ? new Date(input) : input;

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}h:${minutes}m:${seconds}s`;
  }

  checkIsNull(value: string): string
  {
    if (value == null || value == '')
    { return '--' }
    else
    { return value }
  }

  OnConvertData(value: string): string {
    const map: { [key: string]: string } = {
      // Gender
      M: "Masculino",
      F: "Feminino",

      // Marital Status
      Single: "Solteiro(a)",
      Married: "Casado(a)",
      Divorced: "Divorciado(a)",
      Widowed: "Viúvo(a)",
      Separated: "Separado(a)",

      // Document Types
      BI: "BI",
      "Birth Certificate": "Certidão de Nascimento",
      "Driver's Licence": "Carta de Condução",
      Passport: "Passaporte",
      "Voter's Card": "Cartão de Eleitor",
      "Work Card": "Carteira de Trabalho",

      // Relationship Types
      Spouse: "Cônjuge",
      Parent: "Pai/Mãe",
      Sibling: "Irmão/Irmã",
      Child: "Filho/Filha",
      Friend: "Amigo/Amiga",
      Colleague: "Colega",
      Other: "Outro"
    };

    return map[value] ?? value;
  }
}
