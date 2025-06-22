import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { StudentEnrollmentFormModel } from '../_interfaces/student-enrollment-form-model';
import { StudentPaymentModel } from '../_interfaces/student-payment-model';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private readonly myUrl: string = environment.myUrl;

  constructor(private http: HttpClient)
  {}

  PdfGenerateEnrollmentForm = (data: StudentEnrollmentFormModel) =>
    this.http.post(`${this.myUrl}/Documents/Pdf-generate-enrollment-form`, data, {
      responseType: 'blob',
    });

  PngGenerateEnrollmentForm = (data: StudentEnrollmentFormModel) =>
    this.http.post(`${this.myUrl}/Documents/Png-generate-enrollment-form`, data, {
      responseType: 'blob',
    });

  PdfGeneratePaymentReceipt = (data: StudentPaymentModel) =>
    this.http.post(`${this.myUrl}/Documents/Pdf-generate-payment-receipt`, data, {
      responseType: 'blob',
    });

  PngGeneratePaymentReceipt = (data: StudentPaymentModel) =>
    this.http.post(`${this.myUrl}/Documents/Png-generate-payment-receipt`, data, {
      responseType: 'blob',
    });

}
