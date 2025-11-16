import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { HistoriaClinica } from '../../services/historias-clinicas-service';

@Component({
  selector: 'app-historia-clinica-modal',
  imports: [MatDialogModule, MatFormFieldModule, MatButtonModule, MatInputModule, FormsModule, ReactiveFormsModule, MatSlideToggleModule],
  templateUrl: './historia-clinica-modal.html',
  styleUrl: './historia-clinica-modal.css',
})
export class HistoriaClinicaModal implements OnInit {
  public formBase!: FormGroup;
  public claveValor1!: FormGroup;
  public claveValor2!: FormGroup;
  public claveValor3!: FormGroup;
  public claveValor4!: FormGroup;
  public claveValor5!: FormGroup;
  public claveValor6!: FormGroup;

  constructor(private dialogRef: MatDialogRef<HistoriaClinicaModal>) { }

  ngOnInit() {
    this.formBase = new FormGroup({
      altura: new FormControl("", [Validators.required, Validators.pattern(/^\d{1},?\d?$/)]),
      peso: new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)]),
      temperatura: new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)]),
      presion: new FormControl("", [Validators.required, Validators.pattern(/^\d+$/)])
    });

    this.claveValor1 = new FormGroup({
      clave: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
      valor: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
    }, { validators: this.claveValorValidator() });

    this.claveValor2 = new FormGroup({
      clave: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
      valor: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
    }, { validators: this.claveValorValidator() });

    this.claveValor3 = new FormGroup({
      clave: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
      valor: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
    }, { validators: this.claveValorValidator() });

    this.claveValor4 = new FormGroup({
      clave: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
      valor: new FormControl("", [Validators.pattern(/^\d+$/), Validators.min(0), Validators.max(100)]),
    }, { validators: this.claveValorValidator() });

    this.claveValor5 = new FormGroup({
      clave: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
      valor: new FormControl("", Validators.pattern(/^\d+$/)),
    }, { validators: this.claveValorValidator() });

    this.claveValor6 = new FormGroup({
      clave: new FormControl("", Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]*$/)),
      valor: new FormControl(false),
    }, { validators: this.claveValorValidatorSwitch() });


  }

  cancelar() { this.dialogRef.close(); }

  aceptar() {
    if (this.formBase.invalid || this.claveValor1.invalid || this.claveValor2.invalid || this.claveValor3.invalid || this.claveValor4.invalid || this.claveValor5.invalid || this.claveValor6.invalid) {
      this.formBase.markAllAsTouched();
      this.claveValor1.markAllAsTouched();
      this.claveValor2.markAllAsTouched();
      this.claveValor3.markAllAsTouched();
      this.claveValor4.markAllAsTouched();
      this.claveValor5.markAllAsTouched();
      this.claveValor6.markAllAsTouched();
      console.log('entro')
      return;
    }

    const camposDinamicos: { clave: string; valor: string | boolean }[] = [];

    // primeros cinco (strings)
    [this.claveValor1, this.claveValor2, this.claveValor3, this.claveValor4, this.claveValor5].forEach(fg => {
      const c = fg.get('clave')!.value;
      const v = fg.get('valor')!.value;
      camposDinamicos.push({
        clave: c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
        valor: v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
      });
    });

    // 6 (booleano)
    {
      const c = this.clave6!.value;
      const v = this.valor6!.value;
      camposDinamicos.push({
        clave: c.charAt(0).toUpperCase() + c.slice(1).toLowerCase(),
        valor: !!v
      });
    }

    let historiaClinica: HistoriaClinica = {
      altura: this.altura?.value,
      peso: this.peso?.value,
      temperatura: this.temperatura?.value,
      presion: this.presion?.value,
      campos_dinamicos: camposDinamicos
    } as HistoriaClinica

    console.log(camposDinamicos)

    this.dialogRef.close(historiaClinica);
  }

  get altura() {
    return this.formBase.get('altura');
  }
  get peso() {
    return this.formBase.get('peso');
  }
  get temperatura() {
    return this.formBase.get('temperatura');
  }
  get presion() {
    return this.formBase.get('presion');
  }

  get clave1() {
    return this.claveValor1.get('clave');
  }
  get valor1() {
    return this.claveValor1.get('valor');
  }

  get clave2() {
    return this.claveValor2.get('clave');
  }
  get valor2() {
    return this.claveValor2.get('valor');
  }

  get clave3() {
    return this.claveValor3.get('clave');
  }
  get valor3() {
    return this.claveValor3.get('valor');
  }

  get clave4() {
    return this.claveValor4.get('clave');
  }
  get valor4() {
    return this.claveValor4.get('valor');
  }

  get clave5() {
    return this.claveValor5.get('clave');
  }
  get valor5() {
    return this.claveValor5.get('valor');
  }

  get clave6() {
    return this.claveValor6.get('clave');
  }
  get valor6() {
    return this.claveValor6.get('valor');
  }

  claveValorValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const clave = formGroup.get('clave');
      const valor = formGroup.get('valor');
      const respuestaError = { campoVacio: 'Campo vacio' };
      const respuestaClave = clave!.value
      const respuestaValor = valor!.value

      clave!.markAsTouched()
      valor!.markAsTouched()

      if ((respuestaClave && respuestaValor && clave?.valid && valor?.valid) || (!respuestaClave && !respuestaValor)) {
        formGroup.get('clave')?.setErrors(null)
        formGroup.get('valor')?.setErrors(null)
        return null
      }
      else if (!respuestaClave) {
        formGroup.get('clave')?.setErrors(respuestaError)
        return respuestaError
      }
      else {
        formGroup.get('valor')?.setErrors(respuestaError)
        return respuestaError
      }
    };
  }

  claveValorValidatorSwitch(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const clave = formGroup.get('clave');
      const valor = formGroup.get('valor');
      const respuestaError = { campoVacio: 'Campo vacio' };
      const respuestaNoValida = { respuestaNoValida: 'Campo vacio' };
      const respuestaClave = clave!.value
      const respuestaValor = valor!.value

      clave!.markAsTouched()
      valor!.markAsTouched()

      if (respuestaValor && (!respuestaClave || clave?.invalid)) {
        formGroup.get('clave')?.setErrors(respuestaError)
        return respuestaError
      }
      else if (clave?.invalid && respuestaValor) {
        formGroup.get('clave')?.setErrors(respuestaNoValida)
        return respuestaError
      }

      formGroup.get('clave')?.setErrors(null)
      formGroup.get('valor')?.setErrors(null)
      return null
    };
  }
}
