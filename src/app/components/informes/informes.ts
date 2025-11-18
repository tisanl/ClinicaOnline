import { Component, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { UsuarioService } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { TurnosService } from '../../services/turnos-service';
import { Log, LogService } from '../../services/log-service';
import { Sort, MatSortModule } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { CapitalizeAllPipe } from '../../pipes/capitalize-all-pipe';
import { PdfService } from '../../services/pdf-service';
import { MatButton } from '@angular/material/button';
import { Chart, ChartTypeRegistry } from 'chart.js/auto';
import { ViewChild, ElementRef } from '@angular/core';
import { provideNativeDateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-informes',
  imports: [MatTabsModule, MatSortModule, MatButton, DatePipe, NombreCompletoPipe, CapitalizeAllPipe, MatDatepickerModule, MatInputModule, MatFormFieldModule, FormsModule],
  templateUrl: './informes.html',
  styleUrl: './informes.css',
  providers: [provideNativeDateAdapter(),
  { provide: MAT_DATE_LOCALE, useValue: 'es-AR' },
  ],
})
export class Informes implements OnInit {
  public logs: any[] = [];
  public logsSortedData: any[] = [];

  public turnosPorEspecialidad: any[] = [];
  public turnosPorDia: any[] = [];
  public turnosSolicitadosEspecialistaLapsoTiempo: any[] = [];

  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  rangoFechasInvalido = false;

  @ViewChild('graficoTurnosPorEspecialidades') graficoTurnosPorEspecialidadesRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTurnosPorDia') graficoTurnosPorDiaRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTurnosSolicitadosEspecialistaLapsoTiempo') graficoTurnosSolicitadosEspecialistaLapsoTiempoRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('graficoTurnosFinalizadosEspecialistaLapsoTiempo') graficoTurnosFinalizadosEspecialistaLapsoTiempoRef!: ElementRef<HTMLCanvasElement>;

  constructor(private u: UsuarioService, private sa: SweetAlertService, private t: TurnosService, private log: LogService, private pdf: PdfService) { }

  async ngOnInit() {
    await this.onTabChange({ index: 0 });
  }

  async onTabChange(event: any) {
    this.sa.showLoading()

    const index = event.index;
    console.log('Tab activo:', index);

    switch (index) {
      case 0:
        // Tab de logs
        this.logs = await this.log.obtenerTodos()
        this.logsSortedData = this.logs.slice();
        break;

      case 1:
        // Tab de Cantidad de turnos por especialidad
        this.turnosPorEspecialidad = await this.t.obtenerCantidadTurnosPorEspecialidad()
        this.crearGrafico(this.graficoTurnosPorEspecialidadesRef.nativeElement,
          'bar', 'Cantidad de turnos',
          this.turnosPorEspecialidad.map(d => d.nombre),
          this.turnosPorEspecialidad.map(d => d.cantidad));
        break;

      case 2:
        // Tab de Cantidad de turnos por especialidad
        this.turnosPorDia = await this.t.obtenerCantidadTurnosPorDia();
        this.crearGrafico(this.graficoTurnosPorDiaRef.nativeElement, 'line', 'Cantidad de turnos', this.turnosPorDia.map(d => d.dia), this.turnosPorDia.map(d => d.cantidad));
        break;
        
      case 3:
        this.actualizarObtenerTurnosSolicitadosEspecialistasLapsoTiempo()
        break;

      case 4:
        this.actualizarObtenerTurnosFinalizadosEspecialistasLapsoTiempo()
        break;
    }
    this.sa.closeLoading()
  }

  sortData(sort: Sort) {
    const data = this.logs.slice();
    if (!sort.active || sort.direction === '') {
      this.logsSortedData = data;
      return;
    }

    const isAsc = sort.direction === 'asc';

    this.logsSortedData = data.sort((a, b) => {
      switch (sort.active) {
        case 'usuario':
          const aName = `${a.usuario.apellido} ${a.usuario.nombre}`.toLowerCase();
          const bName = `${b.usuario.apellido} ${b.usuario.nombre}`.toLowerCase();
          return (aName < bName ? -1 : 1) * (isAsc ? 1 : -1);
        case 'mail':
          return (a.usuario.mail < b.usuario.mail ? -1 : 1) * (isAsc ? 1 : -1);
        case 'perfil':
          return (a.usuario.perfil < b.usuario.perfil ? -1 : 1) * (isAsc ? 1 : -1);
        case 'created_at':
          return (a.created_at < b.created_at ? -1 : 1) * (isAsc ? 1 : -1);
        default:
          return 0;
      }
    });
  }

  async descargarPdfLogs() {
    await this.pdf.descargarLogs(this.logsSortedData);
  }

  crearGrafico(canvas: HTMLCanvasElement, tipo: keyof ChartTypeRegistry, label: string, labels: string[], valores: number[], usarEscala: boolean = true, stepSize: number = 1): Chart {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * 2;
    canvas.height = height * 2;

    const opcionesEscala =
      usarEscala && (tipo === 'line' || tipo === 'bar')
        ? { y: { beginAtZero: true, ticks: { stepSize } } }
        : undefined;

    Chart.getChart(canvas)?.destroy();

    return new Chart(canvas, {
      type: tipo,
      data: { labels, datasets: [{ label, data: valores }] },
      options: { responsive: false, devicePixelRatio: 2, scales: opcionesEscala }
    });
  }

  async descargarGrafico(canvas: HTMLCanvasElement, titulo: string, archivo: string): Promise<void> {
    const imagen = canvas.toDataURL('image/png');

    const pdf = this.pdf.crearPdfVacio();
    const { nextY } = await this.pdf.agregarEncabezado(pdf, titulo);

    pdf.addImage(imagen, 'PNG', 20, nextY, 170, 100);

    pdf.save(archivo);
  }

  descargarGraficoTurnosPorEspecialidad() {
    this.descargarGrafico(this.graficoTurnosPorEspecialidadesRef.nativeElement, 'Turnos por especialidad', 'informe.pdf');
  }

  descargarGraficoTurnosPorDia() {
    this.descargarGrafico(this.graficoTurnosPorDiaRef.nativeElement, 'Turnos por dia', 'informe.pdf');
  }

  private formatearFecha(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  async actualizarObtenerTurnosSolicitadosEspecialistasLapsoTiempo() {
    const datos = await this.obtenerTurnosSolicitadosEspecialistasLapsoTiempo();
    if (!datos) return;  // rango inválido, no toques la lista ni el gráfico
    this.crearGrafico(this.graficoTurnosSolicitadosEspecialistaLapsoTiempoRef.nativeElement, 'doughnut', 'Cantidad de turnos', datos.map(d => d.nombre), datos.map(d => d.cantidad));
  }

  async obtenerTurnosSolicitadosEspecialistasLapsoTiempo() {
    // 1) Sin fechas → traer todo
    if (!this.fechaDesde && !this.fechaHasta) {
      return await this.t.obtenerCantidadTurnosPorEspecialista();
    }

    // 2) Solo fechaDesde → desde esa fecha hasta hoy
    if (this.fechaDesde && !this.fechaHasta) {
      const desde = this.formatearFecha(this.fechaDesde);
      const hoy = this.formatearFecha(new Date());
      return await this.t.obtenerCantidadTurnosPorEspecialistaEntreFechas(desde, hoy);
    }

    // 3) Solo fechaHasta → desde inicio hasta esa fecha
    if (!this.fechaDesde && this.fechaHasta) {
      const inicio = '1900-01-01';
      const hasta = this.formatearFecha(this.fechaHasta);
      return await this.t.obtenerCantidadTurnosPorEspecialistaEntreFechas(inicio, hasta);
    }

    // 4) Ambas fechas → validar
    if (this.fechaDesde! > this.fechaHasta!) {
      // rango inválido → NO devolver nada nuevo
      return null;
    }

    // 5) Rango válido completo
    const desde = this.formatearFecha(this.fechaDesde!);
    const hasta = this.formatearFecha(this.fechaHasta!);
    return await this.t.obtenerCantidadTurnosPorEspecialistaEntreFechas(desde, hasta);
  }

  descargarGraficoTurnosSolicitadosEspecialistasLapsoTiempo() {
    console.log(this.graficoTurnosSolicitadosEspecialistaLapsoTiempoRef.nativeElement)
    this.descargarGrafico(this.graficoTurnosSolicitadosEspecialistaLapsoTiempoRef.nativeElement, 'Turnos solicitados por especialista en rango de tiempo', 'informe.pdf');
  }

  async actualizarObtenerTurnosFinalizadosEspecialistasLapsoTiempo() {
    const datos = await this.obtenerTurnosFinalizadosEspecialistasLapsoTiempo();
    if (!datos) return;  // rango inválido, no toques la lista ni el gráfico
    this.crearGrafico(this.graficoTurnosFinalizadosEspecialistaLapsoTiempoRef.nativeElement, 'pie', 'Cantidad de turnos', datos.map(d => d.nombre), datos.map(d => d.cantidad), false);
  }

  async obtenerTurnosFinalizadosEspecialistasLapsoTiempo() {
    // 1) Sin fechas → traer todo
    if (!this.fechaDesde && !this.fechaHasta) {
      return await this.t.obtenerCantidadTurnosFinalizadosPorEspecialista();
    }

    // 2) Solo fechaDesde → desde esa fecha hasta hoy
    if (this.fechaDesde && !this.fechaHasta) {
      const desde = this.formatearFecha(this.fechaDesde);
      const hoy = this.formatearFecha(new Date());
      return await this.t.obtenerCantidadTurnosFinalizadosPorEspecialistaEntreFechas(desde, hoy);
    }

    // 3) Solo fechaHasta → desde inicio hasta esa fecha
    if (!this.fechaDesde && this.fechaHasta) {
      const inicio = '1900-01-01';
      const hasta = this.formatearFecha(this.fechaHasta);
      return await this.t.obtenerCantidadTurnosFinalizadosPorEspecialistaEntreFechas(inicio, hasta);
    }

    // 4) Ambas fechas → validar
    if (this.fechaDesde! > this.fechaHasta!) {
      // rango inválido → NO devolver nada nuevo
      return null;
    }

    // 5) Rango válido completo
    const desde = this.formatearFecha(this.fechaDesde!);
    const hasta = this.formatearFecha(this.fechaHasta!);
    return await this.t.obtenerCantidadTurnosFinalizadosPorEspecialistaEntreFechas(desde, hasta);
  }

  descargarGraficoTurnosFinalizadosEspecialistasLapsoTiempo() {
    console.log(this.graficoTurnosFinalizadosEspecialistaLapsoTiempoRef.nativeElement)
    this.descargarGrafico(this.graficoTurnosFinalizadosEspecialistaLapsoTiempoRef.nativeElement, 'Turnos finalizados por especialista en rango de tiempo', 'informe.pdf');
  }
}