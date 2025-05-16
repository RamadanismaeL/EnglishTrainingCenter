import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Chart, ChartOptions, ChartType, ChartDataset, registerables, ScatterDataPoint } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { BaseChartDirective } from 'ng2-charts';
import { Subscription, interval } from 'rxjs';

// Registra todos os componentes necessários do Chart.js uma única vez
Chart.register(...registerables, zoomPlugin);

/*
npm install chart.js
npm install ng2-charts
npm install chartjs-plugin-zoom chartjs-adapter-date-fns date-fns
npm install date-fns chartjs-adapter-date-fns

e no main.ts :
import { Chart } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Configura o adaptador de datas
Chart.register();
*/

@Component({
  selector: 'app-chart-financial-daily-report',
  imports: [
    BaseChartDirective,
    CommonModule
  ],
  templateUrl: './chart-financial-daily-report.component.html',
  styleUrl: './chart-financial-daily-report.component.scss'
})
export class ChartFinancialDailyReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // Configurações do gráfico
  public chartType: ChartType = 'bar';
  public chartData: ChartDataset[] = [];
  public chartLabels: (string | ScatterDataPoint)[] = [];
  private dataSubscription?: Subscription;
  private lastDate: Date = new Date();

  // Opções avançadas com zoom e pan
  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          parser: 'MMM d, yyyy',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: {
            day: 'MMM d',
            week: 'MMM d',
            month: 'MMM yyyy',
            year: 'yyyy'
          },
        },
        bounds: 'data',
        title: {
          display: false,
          text: 'Data'
        },
        grid: {
          display: false,
          drawOnChartArea: true
        },
        ticks: {
          source: 'data',
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
        offset: true,
      },
      y: {
        position: 'right', // Estilo TradingView
        ticks: {
          callback: (value) => `${value} MT`
        },
        title: {
          display: false,
          text: 'Valor (mil MT)'
        },
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y} (MT)`
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          scaleMode: 'x'  // New syntax
        },
        zoom: {
            wheel: {
                enabled: true
            },
            pinch: {
                enabled: true
            },
            mode: 'x',
            scaleMode: 'x'  // New syntax
        },
        limits: {
           // Permite scroll
          x: { min: 'original', max: 'original' },
          y: { min: 'original', max: 'original' }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  ngOnInit(): void {
    // Inicializa com dados vazios
    this.initializeEmptyData();

    // Simula a chegada de novos dados (substituir por conexão real com API/WebSocket)
    this.dataSubscription = interval(30000).subscribe(() => {
      this.simulateNewData();
    });
  }

  ngAfterViewInit(): void {
    this.updateChart();

    if (this.chart?.chart) {
      // Configura o cursor inicial
      this.chart.chart.canvas.style.cursor = 'grab';

      // Adiciona eventos de mouse adicionais
      this.chart.chart.canvas.addEventListener('mousedown', () => {
        this.chart!.chart!.canvas.style.cursor = 'grabbing';
      });

      this.chart.chart.canvas.addEventListener('mouseup', () => {
        this.chart!.chart!.canvas.style.cursor = 'grab';
      });

      this.chart.chart.canvas.addEventListener('mouseleave', () => {
        this.chart!.chart!.canvas.style.cursor = 'default';
      });
    }
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
    this.destroyChart();
  }

  private initializeEmptyData(): void {
    this.chartData = [
      {
        label: 'Revenue',
        data: [],
        backgroundColor: 'rgba(89, 192, 75, 0.6)',
        borderColor: 'rgba(89, 192, 75, 1)',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Expense',
        data: [],
        backgroundColor: 'rgba(255, 99, 99, 0.6)',
        borderColor: 'rgb(255, 99, 99)',
        borderWidth: 1,
        borderRadius: 4
      }
    ];
  }

  private simulateNewData(): void {
    // Avança a data para o próximo mês
    this.lastDate = new Date(this.lastDate.getFullYear(), this.lastDate.getMonth() + 1, 1);

    // Gera dados aleatórios mensais (valores mais altos para representar um mês)
    const newRevenue = Math.floor(Math.random() * 30000) + 15000;  // Entre 15.000 e 45.000
    const newExpense = Math.floor(Math.random() * 25000) + 10000;  // Entre 10.000 e 35.000

    // Adiciona os novos pontos de dados
    this.chartData[0].data.push({ x: this.lastDate.getTime(), y: newRevenue });
    this.chartData[1].data.push({ x: this.lastDate.getTime(), y: newExpense });

    // Atualiza o foco para mostrar os últimos 12 meses (1 ano)
    if (this.chart?.chart?.options?.scales?.['x']) {
        const oneYearAgo = new Date(this.lastDate);
        oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);

        this.chart.chart.options.scales['x'].min = oneYearAgo.getTime();
        this.chart.chart.options.scales['x'].max = this.lastDate.getTime();
    }

    this.updateChart();
  }

  public resetZoom(): void {
    if (this.chart?.chart) {
      // Reseta o zoom e atualiza os limites
      (this.chart.chart as any).resetZoom();

      // Foca novamente nos últimos 14 dias
      const lastDate = this.getLastDate();
      if (lastDate && this.chart.chart.options.scales?.['x']) {
        this.chart.chart.options.scales['x'].min = lastDate.getTime() - (14 * 24 * 60 * 60 * 1000);
        this.chart.chart.options.scales['x'].max = lastDate.getTime();
        this.chart.update();
      }
    }
  }

  private getLastDate(): Date | null {
    if (this.chartData[0].data.length > 0) {
      const lastPoint = this.chartData[0].data[this.chartData[0].data.length - 1] as any;
      return new Date(lastPoint.x);
    }
    return null;
  }

  private updateChart(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  private destroyChart(): void {
    if (this.chart?.chart) {
      this.chart.chart.destroy();
    }
  }
}
