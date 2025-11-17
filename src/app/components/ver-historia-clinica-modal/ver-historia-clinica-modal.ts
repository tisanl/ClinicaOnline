import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DiaHoraTurnoPipe } from '../../pipes/dia-hora-turno-pipe';
import { NombreCompletoPipe } from '../../pipes/nombre-completo-pipe';
import { PdfService } from '../../services/pdf-service';

@Component({
  selector: 'app-ver-historia-clinica-modal',
  imports: [MatDialogModule, MatButtonModule, NombreCompletoPipe, DiaHoraTurnoPipe],
  templateUrl: './ver-historia-clinica-modal.html',
  styleUrl: './ver-historia-clinica-modal.css',
})
export class VerHistoriaClinicaModal implements OnInit {
  readonly data = inject<any>(MAT_DIALOG_DATA);
  public turnos: any[] = this.data.turnos;

  constructor(private dialogRef: MatDialogRef<VerHistoriaClinicaModal>, private pdf: PdfService) { }

  ngOnInit(): void {
    this.turnos = this.data.turnos;
    console.log(this.turnos)
  }

  cerrar() { this.dialogRef.close(); }


  async descargarPdf() {
    await this.pdf.descargarHistoriaClinica(this.turnos);
  }
}
