import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeName'
})
export class CapitalizeNamePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    const v = value.toLowerCase();
    return v.charAt(0).toUpperCase() + v.slice(1);
  }
}
