import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreCompleto'
})
export class NombreCompletoPipe implements PipeTransform {

  transform(u: any): string {
    if (!u) return '';
    const cap = (t: string) => t.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    return `${cap(u.apellido)} ${cap(u.nombre)}`;
  }

}
