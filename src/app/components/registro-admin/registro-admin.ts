import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario, UserData } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';

@Component({
  selector: 'app-registro-admin',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.css',
})
export class RegistroAdmin {
  public form!: FormGroup;
  private mailAmin : string | null = null;

  constructor(private router: Router, private u: UsuarioService, private sa: SweetAlertService) { }

  ngOnInit() {
    // Esto crea el form group, que contendra todos los elementos del formulario y sus validaciones
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      nombre: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      apellido: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]{8,9}$')]),
      edad: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]{1,2}$'),Validators.min(18),Validators.max(120)]),
      imagen1: new FormControl(null, Validators.required),
      passwordAdmin: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    });

    this.mailAmin = this.u.userEmail;
  }

  async registrarUsuario() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      await this.sa.showAlertError('Error en los datos', 'Revise los datos ingresados')
      return;
    }

    this.sa.showLoading();

    const usuario: Usuario = {
      id: '',
      created_at: null,
      email: this.email!.value,
      nombre: this.capitalizar(this.nombre?.value),
      apellido: this.capitalizar(this.apellido?.value),
      dni: this.dni!.value,
      edad: this.edad!.value,
      obra_social: null,
      imagen_1_path: null,
      imagen_2_path: null,
      imagen_1_file: this.imagen1!.value,
      imagen_2_file: null,
      perfil: 'admin',
      estado: null,
      historia_clinica_id: null,
      lista_especialidades_id: null,
      usuario_especialidad: null,
      horarios_especialista: null,
    };

    try {
      await this.u.login(this.mailAmin!, this.passwordAdmin!.value!)

      await this.u.registrar(this.email?.value, this.password?.value, usuario)
      this.u.logout()

      this.u.login(this.mailAmin!, this.passwordAdmin!.value!)

      this.form.reset();

      this.sa.closeLoading();
      await this.sa.showAlertSuccess('Registro completado!', 'El usuario fue creado exitosamente. Debe validar su mail')
      
    }
    catch (e: any) {
      this.sa.closeLoading();
      await this.sa.showAlertError('Error en el registro', e.message)
    }
  }

  // Form para todos
  get email() {
    return this.form.get('email');
  }
  get password() {
    return this.form.get('password');
  }
  get nombre() {
    return this.form.get('nombre');
  }
  get apellido() {
    return this.form.get('apellido');
  }
  get dni() {
    return this.form.get('dni');
  }
  get edad() {
    return this.form.get('edad');
  }
  get imagen1() {
    return this.form.get('imagen1');
  }
  get passwordAdmin() {
    return this.form.get('passwordAdmin');
  }

  onFileSelected(event: any, tipo: string) {
    let file = event.target.files[0];
    if (tipo === 'imagen1') this.imagen1!.setValue(file);
  }

  capitalizar(texto: string) {
    return texto[0].toUpperCase() + texto.slice(1).toLowerCase();
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }
}
