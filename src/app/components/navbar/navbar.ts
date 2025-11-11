import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UsuarioService, UserData } from '../../services/usuario-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {
  private sub!: Subscription;
  userData: UserData | null = null;

  constructor(private router: Router, private u: UsuarioService) { }

  ngOnInit() {
    this.sub = this.u.userObservable.subscribe(() => {
      this.userData = this.u.userData;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goTo(path: string) {
    console.log("Volver al login")
    this.router.navigate([path]);
  }
}
