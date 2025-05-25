export interface StudentListProfileEditDto {
  "order": number | undefined
  "documentType": string
  "idNumber": string
  "placeOfIssue": string
  "expirationDate": string
  "fullName": string
  "dateOfBirth": string
  "dateOfBirthCalc": Date
  "gender": string
  "maritalStatus": string
  "nationality": string
  "placeOfBirth": string
  "residentialAddress": string
  "firstPhoneNumber": string
  "secondPhoneNumber": string
  "emailAddress": string
  "additionalNotes": string
  "guardFullName": string
  "guardRelationship": string
  "guardResidentialAddress": string
  "guardFirstPhoneNumber": string
  "guardSecondPhoneNumber": string
  "guardEmailAddress": string
}
