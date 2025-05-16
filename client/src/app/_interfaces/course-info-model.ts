export interface CourseInfoModel {
  studentId: string;
  courseName: string;
  package: string;
  level: string;
  modality: string;
  academicPeriod: string;
  schedule: string;
  duration: string;
  monthlyFee: number;
  status: string;
  trainerName: string;
  dateUpdate: Date;
  studentData: string; // Ou substitua por StudentDataModel se for referência circular
}
