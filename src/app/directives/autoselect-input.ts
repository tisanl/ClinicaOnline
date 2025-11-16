import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[autoselectInput]'
})
export class AutoselectInput {

  constructor(private el: ElementRef<HTMLInputElement>) { }

  @HostListener('focus')
  onFocus() {
    const input = this.el.nativeElement;
    // pequeño delay para que el focus termine de aplicarse
    setTimeout(() => input.select(), 0);
  }

}
