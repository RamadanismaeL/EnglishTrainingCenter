import { Injectable } from '@angular/core';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class FullScreenService {
  constructor(private message : SnackBarService)
  {}

  // Entrar em fullscreen
  enterFullScreen(elementId? : string) : void {
    const element = elementId
    ? document.getElementById(elementId)
    : document.documentElement;

    if (element?.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        this.message.show('Oops! Unable to enter full screen mode.', 'error')
      });
    }
  }

  // Exit
  exitFullScreen() : void {
    if(document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  // toggle
  toggleFullScreen(elementId?: string): void {
    if (document.fullscreenElement) {
      this.exitFullScreen();
      //this.message.show('Full screen mode deactivated.', 'info')
    } else {
      this.enterFullScreen(elementId);
      //this.message.show('Full screen mode activated.', 'info')
    }
  }
}
