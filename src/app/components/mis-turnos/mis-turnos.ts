import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario, UsuarioService } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { TurnosService } from '../../services/turnos-service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { EncuestaModal } from '../encuesta-modal/encuesta-modal';
import { Encuesta, EncuestasService } from '../../services/encuestas-service';
import { HistoriaClinicaModal } from '../historia-clinica-modal/historia-clinica-modal';
import { HistoriasClinicasService } from '../../services/historias-clinicas-service';
import { MatChipsModule } from '@angular/material/chips';
import { Especialidad } from '../../services/especialidades-service';
import { SupabaseService } from '../../services/supabase-service';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { CapitalizeAllPipe } from '../../pipes/capitalize-all-pipe';
import { DiaHoraTurnoPipe } from '../../pipes/dia-hora-turno-pipe';
import { AutoselectInput } from '../../directives/autoselect-input';
import { PintarEstadoTurno } from '../../directives/pintar-estado-turno';
import { AccionTurno } from '../../directives/accion-turno';
import { VerHistoriaClinicaModal } from '../ver-historia-clinica-modal/ver-historia-clinica-modal';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, MatSortModule, MatTableModule, MatIconModule, MatMenuModule, MatButtonModule, MatChipsModule, MatFormField, MatInputModule, NombreCompletoPipe, CapitalizeAllPipe, DiaHoraTurnoPipe, AutoselectInput, PintarEstadoTurno, AccionTurno],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css',
})
export class MisTurnos implements OnInit {
  public turnos: any[] = [];
  public displayedColumns: string[] = ['especialidad', 'especialista', 'dia', 'estado', 'acciones'];
  public dataSource = new MatTableDataSource<any>([]);
  public columnsToDisplayWithExpand: string[] = [];
  public expandedElement: any | null;
  public perfil: string = '';

  public especialidadesFiltro: Especialidad[] = [];
  public especialidadesSeleccionadas: number[] = [];

  public especialistasFiltro: Usuario[] = [];
  public especialistasSeleccionadas: string[] = [];

  public pacientesFiltro: Usuario[] = [];
  public pacientesSeleccionadas: string[] = [];

  public searchText: string = '';


  @ViewChild(MatSort) sort!: MatSort;

  constructor(private db: SupabaseService, private u: UsuarioService, private sa: SweetAlertService, private t: TurnosService, private dialog: MatDialog, private e: EncuestasService, private hc: HistoriasClinicasService) { }

  async ngOnInit() {
    this.sa.showLoading();

    // Defino la tabla
    this.perfil = this.u.userData!.perfil

    if (this.perfil == 'paciente') this.displayedColumns = ['especialidad', 'especialista', 'dia', 'estado', 'acciones'];
    else if (this.perfil == 'especialista') this.displayedColumns = ['especialidad', 'paciente', 'dia', 'estado', 'acciones'];
    else this.displayedColumns = ['especialidad', 'especialista', 'paciente', 'dia', 'estado', 'acciones'];

    this.columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];

    // Cargo la lista de usuarios
    this.turnos = await this.t.obtenerTurnosPorUsuario(this.u.userId!, this.perfil);

    // Defino el contenido de la tabla
    this.dataSource.data = this.turnos;
    //console.log(this.u.userData)

    // Cargo especialidades de los turnos que traje
    await this.cargarEspecialidades()
    // Cargo especialistas de los turnos que traje
    if (this.perfil == 'especialista') await this.cargarPacientes()
    else if (this.perfil == 'paciente') await this.cargarEspecialistas()
    else {
      await this.cargarPacientes()
      await this.cargarEspecialistas()
    }

    this.sa.closeLoading();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'especialidad':
          return item.especialidad?.nombre || '';
        case 'especialista':
          return `${item.especialista?.apellido || ''} ${item.especialista?.nombre || ''}`.trim();
        case 'paciente':
          return `${item.paciente?.apellido || ''} ${item.paciente?.nombre || ''}`.trim();
        case 'dia':
          if (!item.dia || !item.hora) return 0;
          const fechaHora = new Date(`${item.dia}T${item.hora}`);
          return fechaHora.getTime();
        default:
          return (item as any)[property] ?? '';
      }
    };

    this.dataSource.filterPredicate = (data, filt) => {
      const f = (this.searchText || '').trim().toLowerCase();

      // 1) filtros ya existentes
      const okEspecialidad = this.especialidadesSeleccionadas.includes(data.especialidad.id);

      let okPersona = true;
      if (this.perfil === 'paciente') {
        okPersona = this.especialistasSeleccionadas.includes(data.especialista.id);
      } else if (this.perfil === 'especialista') {
        okPersona = this.pacientesSeleccionadas.includes(data.paciente.id);
      } else {
        okPersona =
          this.especialistasSeleccionadas.includes(data.especialista.id) &&
          this.pacientesSeleccionadas.includes(data.paciente.id);
      }

      const pasanFiltrosPrevios = okEspecialidad && okPersona;

      if (!pasanFiltrosPrevios) return false;

      // 2) filtro por texto
      const especialidad = data.especialidad?.nombre || '';
      const especialista = `${data.especialista?.apellido || ''} ${data.especialista?.nombre || ''}`.trim();
      const paciente = `${data.paciente?.apellido || ''} ${data.paciente?.nombre || ''}`.trim();
      const dia = data.dia ? new Date(data.dia).toLocaleDateString() : '';
      const estado = data.estado || '';
      const horario = data.horario || '';
      const hc = data.historia_clinica;

      const altura = hc?.altura || '';
      const peso = hc?.peso || '';
      const temperatura = hc?.temperatura || '';
      const presion = hc?.presion || '';

      const hcDinamicos = hc?.campos_dinamicos
        ? hc.campos_dinamicos
          .map((cd: { clave: string; valor: string | boolean }) => {
            return `${cd.clave} ${cd.valor}`;
          })
        : [];

      const texto = [
        especialidad,
        especialista,
        paciente,
        dia,
        estado,
        horario,
        altura,
        peso,
        temperatura,
        presion,
        ...hcDinamicos
      ].join(' ').toLowerCase();

      return texto.includes(f);
    };
  }

  isExpanded(element: any): boolean {
    return this.expandedElement === element;
  }

  toggle(element: any): void {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  async cancelarTurno(turno: any) {
    let motivo = await this.sa.pedirInput('Cancelar Turno', 'Seguro que desea cancelar el turno?', 'Motivo de la cancelación');

    if (motivo) {
      this.sa.showLoading();
      motivo = motivo?.trim().toLowerCase().replace(/^./, c => c.toUpperCase());
      await this.t.actualizarTurnoCancelado(turno.id!, 'cancelado', motivo);
      await this.sa.showAlertSuccess('Turno cancelado!', 'El turno fue cancelado con exito')
      turno.estado = 'cancelado'
      turno.motivo_cancelacion = motivo
      this.sa.closeLoading();
    }
  }

  async rechazarTurno(turno: any) {
    let motivo = await this.sa.pedirInput('Rechazar Turno', 'Seguro que desea rechazar el turno?', 'Motivo del rechazo');

    if (motivo) {
      this.sa.showLoading();
      motivo = motivo?.trim().toLowerCase().replace(/^./, c => c.toUpperCase());
      await this.t.actualizarTurnoRechazado(turno.id!, 'rechazado', motivo);
      this.sa.closeLoading();
      await this.sa.showAlertSuccess('Turno rechazado!', 'El turno fue rechazado con exito')
      turno.estado = 'rechazado'
      turno.motivo_rechazo = motivo
    }

  }

  async aceptarTurno(turno: any) {
    this.sa.showLoading();
    await this.t.actualizarEstadoTurno(turno.id!, 'aceptado');
    turno.estado = 'aceptado'
    this.sa.closeLoading();
    await this.sa.showAlertSuccess('Turno aceptado!', 'El turno fue aceptado con exito')
  }

  async finalizarTurno(turno: any) {
    let resena = await this.sa.pedirInput('Reseña', 'Deja una reseña sobre el turno', 'Comentarios');

    if (!resena) return

    const dialogRef = this.dialog.open(HistoriaClinicaModal, { height: '70%' });

    dialogRef.afterClosed().subscribe(async (historiaClinica: any | null) => {
      if (!historiaClinica) return;
      this.sa.showLoading();
      historiaClinica.id_turno = turno.id
      historiaClinica = await this.hc.insert(historiaClinica);
      await this.t.actualizarHistoriaClinica(turno.id, historiaClinica!.id);
      turno.historia_clinica = historiaClinica

      resena = resena!.trim().toLowerCase().replace(/^./, c => c.toUpperCase());
      await this.t.actualizarTurnoFinalizado(turno.id!, 'finalizado', resena);
      this.sa.closeLoading();
      await this.sa.showAlertSuccess('Turno finalizado!', 'Tus comentarios y la historia clinica fueron guardados')
      turno.estado = 'finalizado'
      turno.resena = resena
    });
  }

  async calificarAtencion(turno: any) {
    let calificacion = await this.sa.pedirInput('Calificar atencion', 'Dejenos un comentario sobre la atención?', 'Comentario');

    if (calificacion) {
      this.sa.showLoading();
      calificacion = calificacion?.trim().toLowerCase().replace(/^./, c => c.toUpperCase());
      await this.t.actualizarCalificarAtencion(turno.id, calificacion);
      this.sa.closeLoading();
      await this.sa.showAlertSuccess('Califiacion guardada!', 'Hemos recibido tus comentarios')
      turno.calificar_atencion = calificacion
    }
  }

  async responderEncuesta(turno: any) {
    const dialogRef = this.dialog.open(EncuestaModal, { width: '450px' });


    dialogRef.afterClosed().subscribe(async (encuesta: Encuesta | null) => {
      if (!encuesta) return;
      encuesta.id_turno = turno.id
      encuesta = await this.e.insert(encuesta);
      await this.t.actualizarEncuesta(turno.id, encuesta!.id);
      turno.encuesta = encuesta
    });
  }

  verHistoriaClinica(t: any) {
    const dialogRef = this.dialog.open(VerHistoriaClinicaModal, { height: '70%', data: { turnos: [t] } });
  }

  async cargarEspecialidades() {
    for (const t of this.turnos) {
      const esp = t.especialidad;
      if (esp && !this.especialidadesFiltro.find(e => e.id === esp.id)) {
        this.especialidadesFiltro.push(esp);
      }
    }
    this.especialidadesSeleccionadas = this.especialidadesFiltro.map(e => e.id);
    //console.log(this.especialidadesFiltro)
  }

  filtrarEspecialidades(event: any) {
    this.especialidadesSeleccionadas = event.value;   // ← acá se actualiza la lista
    this.dataSource.filter = Date.now().toString();        // ← obliga a la tabla a recalcular
  }

  async cargarEspecialistas() {
    const setIds = new Set<string>();
    const lista: Usuario[] = [];

    for (const t of this.turnos) {
      const especialista = t.especialista;
      if (especialista && !setIds.has(especialista.id)) {
        setIds.add(especialista.id);
        const { data } = this.db.cliente.storage.from('images').getPublicUrl(especialista.imagen_1_path);
        especialista.imagen_1_path = data.publicUrl
        lista.push(especialista);
      }
    }

    //console.log(lista)
    this.especialistasFiltro = lista;
    this.especialistasSeleccionadas = lista.map(e => e.id);
  }

  filtrarEspecialistas(event: any) {
    this.especialistasSeleccionadas = event.value ?? [];
    this.dataSource.filter = Date.now().toString();     // fuerza a recalcular
  }

  async cargarPacientes() {
    const setIds = new Set<string>();
    const lista: Usuario[] = [];

    for (const t of this.turnos) {
      const paciente = t.paciente;
      if (paciente && !setIds.has(paciente.id)) {
        setIds.add(paciente.id);
        const { data } = this.db.cliente.storage.from('images').getPublicUrl(paciente.imagen_1_path);
        paciente.imagen_1_path = data.publicUrl
        lista.push(paciente);
      }
    }

    //console.log(lista)
    this.pacientesFiltro = lista;
    this.pacientesSeleccionadas = lista.map(e => e.id);
  }

  filtrarPacientes(event: any) {
    this.pacientesSeleccionadas = event.value ?? [];
    this.dataSource.filter = Date.now().toString();       // fuerza a recalcular
  }

  applyFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value || '';

    // guardamos el texto real del input
    this.searchText = value.trim().toLowerCase();

    // actualizamos el filter → esto dispara el filterPredicate
    this.dataSource.filter = Date.now().toString();
  }
}
