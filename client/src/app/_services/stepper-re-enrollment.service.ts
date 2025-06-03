import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepperReEnrollmentService {
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

  resetStepper() {
    this.activeStep.next(0); // Reseta para o primeiro passo (0)
    // Adicione lógica adicional se necessário (limpar formulários, etc.)
  }

  // Método opcional para voltar ao passo anterior
  previousStep() {
    const current = this.activeStep.value;
    if (current > 0) {
      this.activeStep.next(current - 1);
    }
  }
}
