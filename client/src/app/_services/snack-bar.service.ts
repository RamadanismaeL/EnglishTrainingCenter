import { Injectable } from '@angular/core';
import { Snack } from '../_interfaces/snack';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  /*
  constructor(private snackBar : MatSnackBar)
  {}

  showSuccess(message: string, action: string = 'X') {
    this.snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['success-snackbar'] // Css
    });
  }
  */

  snacks: Snack[] = []; // Snack é interface criada a parte

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    // Validação básica
    if(!message || !type)
    {
      console.error('Message or type are required.')
      return;
    }

    const snack : Snack = { message, type };

    // Adiciona o snack ao array
    this.snacks = [snack, ...this.snacks]; // comportamento pilha (LIFO)
    //this.snacks = [...this.snacks, snack]; // comportamento fila

    // Configura o timeout para remover o snack automaticamente
    snack.timeout = setTimeout(() => {
      this.removeSnack(snack);
    }, 8000);
  }

  private removeSnack(snack: Snack)
  {
    // Limpa o timeout se existir
    if (snack.timeout) clearTimeout(snack.timeout);

    // Remove o snack do array
    this.snacks = this.snacks.filter(s => s !== snack);
  }

  close(index: number) {
    if (index < 0 || index >= this.snacks.length)
    {
      console.error('Invalid index.')
      return;
    }

    const snack = this.snacks[index];
    this.removeSnack(snack);
  }

  closeAll() {
    // Limpa todos os timeouts e remove todos os snacks
    this.snacks.forEach(snack => {
      if (snack.timeout) clearTimeout(snack.timeout);
    });
    this.snacks = [];
  }
}
