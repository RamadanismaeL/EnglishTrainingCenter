import { CourseInfoModel } from "./course-info-model";
import { StudentPaymentModel } from "./student-payment-model";

export interface StudentDataModel {
  order: number;
  id: string;
  documentType: string;
  idNumber: string;
  placeOfIssue: string;
  expirationDate: string;
  fullName: string;
  dateOfBirth: string;
  dateOfBirthCalc: Date;
  gender: string;
  maritalStatus: string;
  nationality: string;
  placeOfBirth: string;
  residentialAdress: string;
  firstPhoneNumber: string;
  secondPhoneNumber: string;
  emailAddress: string;
  additionalNotes: string;
  guardFullName: string;
  guardRelationship: string;
  guardResidentialAddress: string;
  guardFirstPhoneNumber: string;
  guardSecondPhoneNumber: string;
  guardEmailAddress: string;
  trainerName: string;
  dateUpdate: Date;
  courseInfo: [];
  enrollmentForm: string;
  payments: StudentPaymentModel[];
}
