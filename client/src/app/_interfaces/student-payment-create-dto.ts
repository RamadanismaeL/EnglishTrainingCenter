export interface StudentPaymentCreateDto
{
  "studentId": string | undefined
  "receivedFrom": string
  "description": string
  "method": string
  "amountMT": number | undefined
}
