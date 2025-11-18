import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { EspecialidadesService, Especialidad } from '../../services/especialidades-service';
import { Captcha } from "../../directives/captcha";


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, Captcha],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro implements OnInit {
  public form!: FormGroup;
  public formPaciente!: FormGroup;
  public formEspecialista!: FormGroup;
  public especialidades: Especialidad[] = [];

  constructor(private router: Router, private u: UsuarioService, private e: EspecialidadesService, private sa: SweetAlertService) { }

  async ngOnInit() {
    // Esto crea el form group, que contendra todos los elementos del formulario y sus validaciones
    this.form = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      nombre: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      apellido: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      dni: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]{8,9}$')]),
      edad: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]{1,2}$'), Validators.min(18), Validators.max(120)]),
      imagen1: new FormControl(null, Validators.required),
      perfil: new FormControl(null, Validators.required),
      captcha: new FormControl("", Validators.required),
    })

    this.formPaciente = new FormGroup({
      obraSocial: new FormControl(null, [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]),
      imagen2: new FormControl(null, Validators.required),
    })

    this.formEspecialista = new FormGroup({
      especialidadesChecks: new FormControl<number[]|null>(null, Validators.required),
      especialidadNueva: new FormControl(null, [Validators.pattern('^[a-zA-Z ]+$')]),
    })

    console.log(this.especialidadNueva)
    this.especialidades = await this.e.obtenerEspecialidades();
  }

  async registrarUsuario() {
    if (this.form.invalid && (this.formPaciente.invalid || this.formEspecialista.invalid)) {
      console.log(this.form)
      this.form.markAllAsTouched();
      this.formPaciente.markAllAsTouched();
      this.formEspecialista.markAllAsTouched();
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
      obra_social: this.obraSocial!.value,
      imagen_1_path: null,
      imagen_2_path: null,
      imagen_1_file: this.imagen1!.value,
      imagen_2_file: this.imagen2!.value,
      perfil: this.perfil!.value,
      estado: null,
      historia_clinica_id: null,
      lista_especialidades_id: this.especialidadesChecks!.value,
      usuario_especialidad: null,
      horarios_especialista: null,
    };

    try {
      await this.u.registrar(this.email?.value, this.password?.value, usuario)

      this.sa.closeLoading();

      if(usuario.perfil == 'especialista'){
        this.u.logout()
        await this.sa.showAlertSuccess('Registro completado!', 'Seras enviado al Login. Recorda validar tu mail antes de ingresar y que un Aministrador debe habilitarte')
      }
      else await this.sa.showAlertSuccess('Registro completado!', 'Seras enviado al Login. Recorda validar tu mail antes de ingresar')
      this.goTo('login');
    }
    catch (e: any) {
      this.sa.closeLoading();
      await this.sa.showAlertError('Error en el registro', e.message)
    }
  }

  async agregarEspecialidad() {
    if (!this.especialidadNueva!.value) return;
    this.sa.showLoading();
    let nombre = this.capitalizar(this.especialidadNueva!.value.trim());
    await this.e.guardarEspecialidad(nombre);
    this.especialidadNueva!.setValue('')
    this.especialidades = await this.e.obtenerEspecialidades();
    this.sa.closeLoading();
  }

  onToggleEspecialidad(id: number, event: Event) {
    // Se ejecuta cuando el usuario marca o desmarca un checkbox de especialidad.
    // Recibe el id de la especialidad y el evento del checkbox.

    // Obtiene si el checkbox fue marcado (true) o desmarcado (false)
    const checked = (event.target as HTMLInputElement).checked;

    // Referencia al FormControl que guarda las especialidades seleccionadas
    const ctrl = this.especialidadesChecks!;

    // Obtiene el valor actual del control (array de IDs) o un array vacío si no hay nada
    const actuales = ctrl.value ?? [];

    if (checked) {
      // Si el checkbox fue marcado, agrega el id al array de seleccionadas
      ctrl.setValue([...actuales, id]);
    } else {
      // Si fue desmarcado, quita el id del array
      ctrl.setValue(actuales.filter((x: number) => x !== id));
    }

    // Marca el control como "tocado" para que se activen las validaciones visuales
    ctrl.markAsTouched();
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
  get perfil() {
    return this.form.get('perfil');
  }
  get captcha() {
    return this.form.get('captcha');
  }

  // Form Paciente
  get obraSocial() {
    return this.formPaciente.get('obraSocial');
  }
  get imagen2() {
    return this.formPaciente.get('imagen2');
  }

  // Form Especialista
  get especialidadNueva() {
    return this.formEspecialista.get('especialidadNueva');
  }
  get especialidadesChecks() {
    return this.formEspecialista.get('especialidadesChecks');
  }

  onFileSelected(event: any, tipo: string) {
    let file = event.target.files[0];
    if (tipo === 'imagen1') this.imagen1!.setValue(file);
    else if (tipo === 'imagen2') this.imagen2!.setValue(file);
  }

  capitalizar(texto: string) {
    return texto[0].toUpperCase() + texto.slice(1).toLowerCase();
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

}
