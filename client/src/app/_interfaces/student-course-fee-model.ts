import { StudentPaymentModel } from "./student-payment-model";

export interface StudentCourseFeeModel {
  "order": number
  "id": string
  "priceTotal": number
  "pricePaid": number
  "priceDue": number
  "status": string
  "dateUpdate": Date
  "studentId": string
  "studentData": string
  "payments": StudentPaymentModel[]
}
