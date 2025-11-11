import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login {
  public form!: FormGroup;

  constructor(private router: Router, private u: UsuarioService, private sa: SweetAlertService, private iconRegistry: MatIconRegistry) {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }

  ngOnInit() {
    // Esto crea el form group, que contendra todos los elementos del formulario y sus validaciones
    this.form = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required, Validators.minLength(6)]),
    })
  }

  async login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.sa.showAlertError('Error en los datos', 'Revise los datos ingresados')
      return;
    }

    this.sa.showLoading();

    try {
      await this.u.login(this.email?.value, this.password?.value);
      this.sa.closeLoading();
      await this.sa.showAlertSuccess('Ingreso completado!', 'Bienvenido ' + this.u.userData!.nombre)
      this.goTo('home');
    }
    catch (e: any) {
      this.sa.closeLoading();
      await this.sa.showAlertError('Error al ingresar', e.message)
    }
  }

  autocompletar(tipo: string) {
  switch (tipo) {
    case 'administrador':
      this.form.patchValue({
        email: 'nahorij455@fandoe.com',
        password: '123456'
      });
      break;

    case 'especialista':
      this.form.patchValue({
        email: 'kenir92926@limtu.com',
        password: '123456'
      });
      break;

    case 'paciente':
      this.form.patchValue({
        email: 'govol30777@fandoe.com',
        password: '123456'
      });
      break;
  }
}

  // Form para todos
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }

  goTo(path: string) {
    console.log("Volver al login")
    this.router.navigate([path]);
  }

}
