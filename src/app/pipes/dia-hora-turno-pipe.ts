import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'diaHoraTurno'
})
export class DiaHoraTurnoPipe implements PipeTransform {

  transform(turno: any): string {
    if (!turno || !turno.dia || !turno.hora) return '';

    // dia = "2025-11-13"
    const fecha = new Date(turno.dia);
    const dd = String(fecha.getDate()).padStart(2, '0');
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const yyyy = fecha.getFullYear();

    // hora = "12:00:00" → nos quedamos con "12:00"
    const hora = turno.hora.slice(0, 5);

    return `${dd}/${mm}/${yyyy} ${hora}`;
  }

}
