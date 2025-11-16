import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalizeAll'
})
export class CapitalizeAllPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
