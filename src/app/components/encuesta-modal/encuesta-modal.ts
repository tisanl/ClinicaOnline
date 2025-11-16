import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Encuesta } from '../../services/encuestas-service';

@Component({
  selector: 'app-encuesta-modal',
  imports: [MatDialogModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './encuesta-modal.html',
  styleUrl: './encuesta-modal.css',
})
export class EncuestaModal implements OnInit {
  public form!: FormGroup;

  constructor(private dialogRef: MatDialogRef<EncuestaModal>) {}

  ngOnInit() {
    this.form = new FormGroup({
      atencion: new FormControl("", Validators.required),
      puntualidad: new FormControl("", Validators.required),
      resolucion: new FormControl("", Validators.required),
    })
  }

  cancelar() { this.dialogRef.close(); }

  aceptar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let encuesta: Encuesta = {
      atencion: this.atencion?.value,
      puntualidad: this.puntualidad?.value,
      resolucion: this.resolucion?.value
    } as Encuesta
    
    this.dialogRef.close(encuesta);
  }

  get atencion() {
    return this.form.get('atencion');
  }
  get puntualidad() {
    return this.form.get('puntualidad');
  }
  get resolucion() {
    return this.form.get('resolucion');
  }

}
