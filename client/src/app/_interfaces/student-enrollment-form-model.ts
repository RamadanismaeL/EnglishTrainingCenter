import { StudentDataModel } from "./student-data-model";

export interface StudentEnrollmentFormModel {
  studentId: string;
  studentData: StudentDataModel;
  courseName: string;
  package: string;
  level: string;
  modality: string;
  academicPeriod: string;
  schedule: string;
  duration: string;
  monthlyFee: number;
  age: number;
  courseFee: number;
  installments: number;
  days: number;
  months: string;
  years: number;
  times: string | Date;
  trainerName: string;
}
