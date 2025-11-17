import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { HorariosEspecialistaService, HorarioEspecialista } from '../../services/horarios-especialista-service';
import { TurnosService } from '../../services/turnos-service';
import { MatDialog } from '@angular/material/dialog';
import { VerHistoriaClinicaModal } from '../ver-historia-clinica-modal/ver-historia-clinica-modal';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mi-perfil',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule],
  templateUrl: './mi-perfil.html',
  styleUrl: './mi-perfil.css',
})
export class MiPerfil implements OnInit {
  public usuario: Usuario | null = null;
  horariosForm!: FormGroup;

  constructor(private u: UsuarioService, private sa: SweetAlertService, private he: HorariosEspecialistaService, private t: TurnosService, private dialog: MatDialog) { }

  async ngOnInit() {
    this.sa.showLoading();
    this.usuario = await this.u.obtenerUsuarioPorId(this.u.userId!);
    //console.log(this.usuario)
    this.sa.closeLoading();

    if (this.usuario.perfil === 'especialista')
      this.horariosForm = new FormGroup({
        horarios: new FormArray(
          this.usuario.horarios_especialista!.map(h =>
            new FormGroup({
              id: new FormControl(h.id),
              dia_semana: new FormControl(h.dia_semana),
              activo: new FormControl(h.activo),
              hora_inicio: new FormControl(h.hora_inicio, [Validators.pattern('^[0-9]{1,2}$')]),
              hora_fin: new FormControl(h.hora_fin, [Validators.pattern('^[0-9]{1,2}$')]),
            }, { validators: this.validarHorarioGrupo })
          )
        )
      });
  }

  async guardarHorarios(): Promise<void> {
    if (this.horariosForm.invalid) {
      await this.sa.showAlertError('Error en los datos', 'Revise los datos ingresados')
      return;
    }

    this.sa.showLoading();

    const horarios: HorarioEspecialista[] = this.horariosArray.controls.map(c => c.value);

    try {
      await this.he.actualizarHorariosEspecialista(horarios)
      this.sa.closeLoading();
      await this.sa.showAlertSuccess('Registro completado!', 'Los horarios fueron actualizados')
    }
    catch (e: any) {
      this.sa.closeLoading();
      await this.sa.showAlertError('Error en el registro', e.message)
    }
  }

  get horariosArray(): FormArray {
    return this.horariosForm.get('horarios') as FormArray;
  }

  validarHorarioGrupo(control: AbstractControl) {
    const activo = control.get('activo')?.value;
    const inicio = Number(control.get('hora_inicio')?.value);
    const fin = Number(control.get('hora_fin')?.value);
    const dia = Number(control.get('dia_semana')?.value);

    if (!activo) return null;
    if (isNaN(inicio) || isNaN(fin)) return { horarioInvalido: true };

    const maxHora = dia === 6 ? 14 : 18; // sábado hasta las 14
    if (inicio < 9 || fin > maxHora || fin <= inicio) return { horarioInvalido: true };

    return null;
  }

  capitalizar(texto: string) {
    return texto[0].toUpperCase() + texto.slice(1).toLowerCase();
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

  async verHistoriaClinica() {
    this.sa.showLoading();
    const turnos = await this.t.obtenerTurnosFinalizadosPaciente(this.u.userId!);
    this.sa.closeLoading();
    console.log(turnos)
    const dialogRef = this.dialog.open(VerHistoriaClinicaModal, { data: { turnos: turnos } });
  }
}
