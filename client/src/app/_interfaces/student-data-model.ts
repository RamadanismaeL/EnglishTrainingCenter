import { StudentCourseFeeModel } from "./student-course-fee-model";
import { StudentCourseInfoDetails } from "./student-course-info-details";
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
  enrollmentForm: string;
  studentCourseFee: StudentCourseFeeModel;
  courseInfo: StudentCourseInfoDetails [];
  payments: StudentPaymentModel[];
}
