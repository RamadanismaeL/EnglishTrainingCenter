import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepperChangePasswordService {
  // Armazena o passo atual do processo (inicia o passo 1) e permite reatividade
  private activeStep = new BehaviorSubject<number>(0);

  // Expondo o BehaviorSubject como um Observable para que outros componentes possam se inscrever e reagir às mudanças
  activeStep$ = this.activeStep.asObservable();


  // Atualiza o passo atual
  // Quando chamado, muda o valor de activeStep e notifica todos os assinantes
  setActiveStep(step: number)
  {
    this.activeStep.next(step); // Dispara a atualização do passo
  }
}
