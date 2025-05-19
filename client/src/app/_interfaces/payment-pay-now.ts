export interface PaymentPayNow {
  studentId: string | undefined;
  fullName: string | undefined;
  package: string | undefined;
  level: string | undefined;
  modality: string | undefined;
  academicPeriod: string | undefined;
  schedule: string | undefined;
  amountToPay: number | undefined;
}
