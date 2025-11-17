import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeAll'
})
export class CapitalizeAllPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
