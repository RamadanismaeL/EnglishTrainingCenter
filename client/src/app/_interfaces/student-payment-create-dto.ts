export interface StudentPaymentCreateDto
{
  "studentId": string | undefined
  "receivedFrom": string
  "paymentType": string
  "description": string
  "method": string
  "amountMT": number | undefined
}
