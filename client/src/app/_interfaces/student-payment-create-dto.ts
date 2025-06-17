export interface StudentPaymentCreateDto
{
  "studentId": string | undefined
  "courseFeeId": string | undefined | null
  "receivedFrom": string
  "description": string | undefined
  "method": string
  "amountMT": number | undefined
}
