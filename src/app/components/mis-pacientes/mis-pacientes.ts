import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { TurnosService } from '../../services/turnos-service';
import { VerHistoriaClinicaModal } from '../ver-historia-clinica-modal/ver-historia-clinica-modal';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-mis-pacientes',
  imports: [CommonModule, MatButtonModule],
  templateUrl: './mis-pacientes.html',
  styleUrl: './mis-pacientes.css',
})
export class MisPacientes implements OnInit {
  public usuarios: Usuario[] = [];

  constructor(private u: UsuarioService, private sa: SweetAlertService, private t: TurnosService, private dialog: MatDialog) { }

  async ngOnInit() {
    this.sa.showLoading();
    this.usuarios = await this.t.obtenerPacientesDeEspecialista(this.u.userId!);
    console.log(this.usuarios)
    this.sa.closeLoading();
  }

  async verHistoriaClinica(usuarioId: string) {
    this.sa.showLoading();
    const turnos = await this.t.obtenerTurnosFinalizadosPaciente(usuarioId);
    this.sa.closeLoading();
    console.log(turnos)
    const dialogRef = this.dialog.open(VerHistoriaClinicaModal, { data: { turnos: turnos } });
  }

  capitalizar(texto: string) {
    return texto[0].toUpperCase() + texto.slice(1).toLowerCase();
  }
}