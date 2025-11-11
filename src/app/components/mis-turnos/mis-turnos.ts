import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormArray, AbstractControl } from '@angular/forms';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { HorariosEspecialistaService, HorarioEspecialista } from '../../services/horarios-especialista-service';
import { EspecialidadesService, Especialidad } from '../../services/especialidades-service';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css',
})
export class MisTurnos implements OnInit {
  public especialidades: Especialidad[] = [];
  public especialidadSeleccionada: Especialidad | null = null;

  constructor(private u: UsuarioService, private sa: SweetAlertService, private he: HorariosEspecialistaService, private e: EspecialidadesService) { }

  async ngOnInit() {
    this.sa.showLoading();
    this.especialidades = await this.e.obtenerEspecialidades();
    this.sa.closeLoading();
  }

  seleccionarEspecialidad(e: Especialidad) {
    this.especialidadSeleccionada = e;
  }
}
