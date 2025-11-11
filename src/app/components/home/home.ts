import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsuarioService, UserData } from '../../services/usuario-service';
import { Router } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SweetAlertService } from '../../services/sweet-alert-service';

@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy{
  private sub!: Subscription;
  userData: UserData | null = null;

  constructor(private router: Router, private u: UsuarioService, private iconRegistry: MatIconRegistry, private sa: SweetAlertService) {  }

  ngOnInit() {
    this.iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    this.sub = this.u.userObservable.subscribe(() => {
      this.userData = this.u.userData;
    });
  }

  async cerrarSesion(){
    this.sa.showLoading();
    await this.u.logout()
    this.sa.closeLoading();
    this.goTo('landingPage')
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goTo(path: string) {
    console.log("Volver al login")
    this.router.navigate([path]);
  }
}