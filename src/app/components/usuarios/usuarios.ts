import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { Router } from '@angular/router';
import { SweetAlertService } from '../../services/sweet-alert-service';

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  public usuarios: Usuario[] = [];

  constructor(private router: Router, private u: UsuarioService, private sa: SweetAlertService) { }

  async ngOnInit() {
    this.sa.showLoading();
    this.usuarios = await this.u.obtenerUsuarios();
    console.log(this.usuarios)
    this.sa.closeLoading();
  }

  async cambiarEstado(id: string, estado: string) {
    this.sa.showLoading();
    await this.u.modificarEstadoUsuario(id, estado);

    const usuario = this.usuarios.find(u => u.id === id);
    if (usuario) usuario.estado = estado;

    this.sa.closeLoading();
  }

  capitalizar(texto: string) {
    return texto[0].toUpperCase() + texto.slice(1).toLowerCase();
  }
}
