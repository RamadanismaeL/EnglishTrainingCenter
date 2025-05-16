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
  selector: 'app-chart-financial-cash-flow',
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule
  ],
  templateUrl: './chart-financial-cash-flow.component.html',
  styleUrls: ['./chart-financial-cash-flow.component.scss']
})
export class ChartFinancialCashFlowComponent implements OnInit, AfterViewInit, OnDestroy {
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
    /* Avança a data para simular novos dados
    this.lastDate = new Date(this.lastDate.getTime() + (24 * 60 * 60 * 1000));

    // Gera dados aleatórios (substituir por chamada API real)
    const newRevenue = Math.floor(Math.random() * 1000) + 500;
    const newExpense = Math.floor(Math.random() * 800) + 300;

    // Adiciona os novos pontos de dados
    this.chartData[0].data.push({ x: this.lastDate.getTime(), y: newRevenue });
    this.chartData[1].data.push({ x: this.lastDate.getTime(), y: newExpense });

    / Atualiza o foco para mostrar os últimos 14 dias
    if (this.chart?.chart?.options?.scales?.['x']) {
      this.chart.chart.options.scales['x'].min = this.lastDate.getTime() - (14 * 24 * 60 * 60 * 1000);
      this.chart.chart.options.scales['x'].max = this.lastDate.getTime();
    }

    /* Remove dados antigos para manter performance (365 dias de histórico)
    if (this.chartData[0].data.length > 365) {
      this.chartData[0].data.shift();
      this.chartData[1].data.shift();
    }
    */

    this.updateChart();

    /*
    this.dataSubscription = this.financialService.getRealTimeData().pipe(
      throttleTime(500), // Evita sobrecarga
      bufferTime(1000), // Agrupa atualizações
      filter(updates => updates.length > 0)
    ).subscribe(updates => {
      const now = new Date();

      updates.forEach(update => {
        this.chartData[0].data.push({ x: now, y: update.revenue });
        this.chartData[1].data.push({ x: now, y: update.expense });
      });

      // Mantém apenas os últimos N pontos para performance
      if (this.chartData[0].data.length > MAX_DATA_POINTS) {
        this.chartData.forEach(dataset => {
          dataset.data = dataset.data.slice(-MAX_DATA_POINTS);
        });
      }

      this.updateChart();
    });
    */
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



/*
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
//PIE
import { TooltipComponent } from 'echarts/components';
import { LegendComponent } from 'echarts/components';
//LINE
import { TitleComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';

// import necessary echarts components
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, GridComponent, CanvasRenderer, PieChart, TooltipComponent, LegendComponent, TitleComponent, LineChart]);

@Component({
  selector: 'app-chart-financial-cash-flow',
  imports: [
    CommonModule,
    NgxEchartsDirective
  ],
  templateUrl: './chart-financial-cash-flow.component.html',
  styleUrl: './chart-financial-cash-flow.component.scss',
  providers: [
    provideEchartsCore({ echarts })
  ]
})
export class ChartFinancialCashFlowComponent {
  //BAR
  chartOption: EChartsOption = {
    grid: {
      left: '2%',
      right: '2%',
      top: '5%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Jan/2024', 'Feb/2024', 'Mar/2024', 'Apr/2024', 'May/2024', 'Jun/2024', 'Jul/2024', 'Aug/2024', 'Sep/2024', 'Oct/2024', 'Nov/2024', 'Dec/2024'],
      axisLabel: {
        rotate: 30,
        interval: 0,
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Sales (mil)',
        type: 'bar',
        data: [{value: 30, itemStyle: {color: '#32a850'}}, 99, 78, 56, 25, 69, 90, 29, 12, 87, 91, 121],
        label: {
          show: true,
          position: 'top',
          formatter: '{c} mil (MT)'
        },
        itemStyle: {
          color: '#674f77'
        }
      }
    ],
    animation: true,
    animationEasing: 'backOut',
    animationDuration: 2000,
    responsive: true
  };

  //PIE
  chartOption2: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: 'Sales (mil)',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 30, name: 'January/2024', itemStyle: { color: '#32a850' } },
          { value: 99, name: 'February/2024', itemStyle: { color: '#50a8c0' } },
          { value: 78, name: 'March/2024', itemStyle: { color: '#a832c0' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c} mil (MT)'
        }
      }
    ]
  };

  //LINE
  chartOption3: EChartsOption = {
    title: {
      text: 'Sales Price',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b0}: ${c0}'
    },
    xAxis: {
      type: 'category',
      data: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05', '2024-01-06', '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10', '2024-01-11', '2024-01-12', '2024-01-13', '2024-01-14', '2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19', '2024-01-20', '2024-01-21'],
      axisLabel: {
        formatter: function (value: string) {
          return value.split('-').slice(1).join('/'); // Formato MM/DD
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} MT'
      }
    },
    series: [
      {
        name: 'Price',
        type: 'line',
        data: [4500, 46000, 4700, 46500, 8000, 5500, 76000, 7700, 77800, 80000, 4500, 46000, 4700, 46500, 80000, 4500, 46000, 4700, 46500, 80000, 90000],
        smooth: true,
        lineStyle: {
          color: '#5470C6',
          width: 2
        },
        areaStyle: {
          color: 'rgba(84, 112, 198, 0.2)'
        },
        itemStyle: {
          color: '#5470C6'
        },
        showSymbol: false // Remove os pontos na linha para um visual mais limpo
      }
    ]
  };

  // line 2
  chartOption4: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['January/2024', 'February/2024', 'March/2024', 'April/2024', 'May/2024', 'June/2024', 'July/2024', 'August/2024', 'September/2024', 'October/2024', 'November/2024', 'December/2024'],
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Sales (mil)',
        type: 'line',
        data: [{value: 30, itemStyle: {color: '#32a850'}}, 99, 78, 56, 25, 69, 90, 29, 12, 87, 91, 121],
        label: {
          show: true,
          position: 'top',
          formatter: '{c} mil (MT)'
        },
        itemStyle: {
          color: '#674f77'
        }
      }
    ],
    animation: true,
    animationEasing: 'backOut',
    animationDuration: 2000
  };

  // LINE AND BAR
  chartOption5: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['January/2024', 'February/2024', 'March/2024', 'April/2024', 'May/2024', 'June/2024', 'July/2024', 'August/2024', 'September/2024', 'October/2024', 'November/2024', 'December/2024'],
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: 'Sales (mil)',
        type: 'line',
        data: [{value: 30, itemStyle: {color: '#32a850'}}, 99, 78, 56, 25, 69, 90, 29, 12, 87, 91, 121],
        label: {
          show: true,
          position: 'top',
          formatter: '{c} mil (MT)'
        },
        itemStyle: {
          color: '#38f0da'
        }
      },
      {
        name: 'Sales (mil)',
        type: 'bar',
        data: [{value: 30, itemStyle: {color: '#32a850'}}, 99, 78, 56, 25, 69, 90, 29, 12, 87, 91, 121],
        itemStyle: {
          color: '#674f77'
        }
      }
    ],
    animation: true,
    animationEasing: 'backOut',
    animationDuration: 2000
  };

}
*/
