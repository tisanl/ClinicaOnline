import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { NgStyle } from '@angular/common';
import { UsuarioService } from './services/usuario-service'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, NgStyle],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ClinicaOnline');

  constructor(private u: UsuarioService) { 
    //this.u.logout()
  }
}
