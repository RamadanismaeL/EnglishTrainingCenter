export interface StudentPaymentModel {
  order: number;
  id: string;
  receivedFrom: string;
  descriptionEnglish: string;
  descriptionPortuguese: string;
  method: string;
  amountMT: number;
  inWords: string;
  status: string;
  days: number;
  months: string;
  years: number;
  times: string;
  dateRegister: Date;
  studentId: string;
  studentData: string;
  trainerId: string;
  trainerName: string;
  trainer?: null; // Opcional
}
