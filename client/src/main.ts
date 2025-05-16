import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Configura o adaptador de datas
Chart.register(/* seus plugins */);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
