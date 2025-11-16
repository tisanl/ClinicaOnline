import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { HorariosEspecialistaService, HorarioEspecialista } from '../../services/horarios-especialista-service';
import { EspecialidadesService, Especialidad } from '../../services/especialidades-service';
import { TurnosService, TurnoNuevo } from '../../services/turnos-service';

@Component({
  selector: 'app-sacar-turno',
  imports: [DatePipe],
  templateUrl: './sacar-turno.html',
  styleUrl: './sacar-turno.css',
})
export class SacarTurno implements OnInit {
  public especialidades: Especialidad[] = [];
  public especialidadSeleccionada: Especialidad | null = null;
  public profesionales: Usuario[] = [];
  public profesionalSeleccionado: Usuario | null = null;
  public diaSeleccionado: number | null = null;
  public turnosSemanas: { fecha: Date; turnos: string[] }[] = [];
  public pacientes: Usuario[] = [];
  public pacienteSeleccionado: Usuario | null = null;

  constructor(public u: UsuarioService, private sa: SweetAlertService, private he: HorariosEspecialistaService, private e: EspecialidadesService, private t: TurnosService) { }

  async ngOnInit() {
    this.sa.showLoading();
    this.especialidades = await this.e.obtenerEspecialidades();

    if (this.u.userData!.perfil === 'admin')
      this.pacientes = await this.u.obtenerUsuariosPacientes();

    this.sa.closeLoading();
  }

  async seleccionarEspecialidad(e: Especialidad) {
    console.log(e.nombre)
    this.sa.showLoading();
    this.especialidadSeleccionada = e;
    this.profesionalSeleccionado = null;
    this.pacienteSeleccionado = null;
    this.diaSeleccionado = null;
    this.profesionales = await this.u.obtenerUsuariosEspecialistasPorEspecialidad(this.especialidadSeleccionada.id);
    this.sa.closeLoading();
  }

  async seleccionarProfesional(u: Usuario) {
    console.log(u.nombre)
    this.sa.showLoading();
    this.profesionalSeleccionado = u;
    this.sa.closeLoading();
  }

  async seleccionarPaciente(u: Usuario) {
    console.log(u.nombre)
    this.pacienteSeleccionado = u;
    this.diaSeleccionado = null;
  }

  async seleccionarDia(he: HorarioEspecialista) {
    if(this.u.userData!.perfil === 'admin' && !this.pacienteSeleccionado){
      await this.sa.showAlertError('Paciente', 'Primero selecciona un paciente')
      return
    }

    console.log('Día seleccionado:', he.dia_semana);
    this.sa.showLoading();
    this.diaSeleccionado = he.dia_semana;

    const hoy = new Date();
    const fechas: Date[] = [];

    // Buscar los próximos 15 días que coincidan con el día de atención
    for (let i = 1; i <= 15; i++) {
      const fecha = new Date();
      fecha.setDate(hoy.getDate() + i);
      if (fecha.getDay() === he.dia_semana) fechas.push(fecha);
    }

    const generarTurnos = (inicio: number, fin: number): string[] => {
      const turnos: string[] = [];
      for (let hora = inicio; hora < fin; hora++) {
        turnos.push(`${hora}:00`);
        turnos.push(`${hora}:30`);
      }
      return turnos;
    };

    const ocupadosProfesional = await this.t.obtenerTurnosProx15Dias(this.profesionalSeleccionado!.id, 'especialista');
    const ocupadosPaciente = this.u.userData!.perfil === 'admin' ? await this.t.obtenerTurnosProx15Dias(this.pacienteSeleccionado!.id, 'paciente') : [];

    this.turnosSemanas = fechas.slice(0, 2).map(fecha => ({
      fecha,
      turnos: generarTurnos(Number(he.hora_inicio), Number(he.hora_fin))
        .filter(t =>
          !ocupadosProfesional.some(o => o.dia === fecha.toISOString().slice(0, 10) && o.hora === t + ':00') &&
          !ocupadosPaciente.some(o => o.dia === fecha.toISOString().slice(0, 10) && o.hora === t + ':00'))
    }));

    console.log(this.turnosSemanas);
    this.sa.closeLoading();
  }

  async seleccionarTurno(fecha: Date, hora: string) {
    const confirmado = await this.sa.confirmarAccion(
      '¿Confirmar turno?',
      `¿Querés reservar el turno del ${fecha.toLocaleDateString()} a las ${hora}?`
    );

    if (!confirmado) return;

    this.sa.showLoading();

    const pacienteId = this.u.userData!.perfil === 'admin' ? this.pacienteSeleccionado!.id : this.u.userId;

    const nuevoTurno: TurnoNuevo = {
      dia: fecha,
      hora,
      id_paciente: pacienteId,
      id_especialista: this.profesionalSeleccionado!.id,
      id_especialidad: this.especialidadSeleccionada!.id,
      estado: 'pendiente',
    };

    const exito = await this.t.crearTurno(nuevoTurno);

    this.sa.closeLoading();

    if (exito)
      this.sa.showAlertSuccess('Turno reservado', 'Tu turno fue registrado correctamente.');
    else
      this.sa.showAlertError('Error', 'No se pudo registrar el turno.');
  }

  obtenerNombreDia(dia: number): string {
    const dias = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado'
    ];
    return dias[dia] ?? '';
  }

  get diasDisponibles() {
    return this.profesionalSeleccionado?.horarios_especialista?.filter(h => h.activo) || [];
  }
}