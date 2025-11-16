import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[pintarEstadoTurno]'
})
export class PintarEstadoTurno implements OnChanges {

  @Input('pintarEstadoTurno') estado: string = '';

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) { }

  ngOnChanges(): void {

    let fondo = '';
    let texto = '';

    switch (this.estado) {

      case 'pendiente':
        fondo = '#3b82f6';   // amarillo claro
        texto = '#000000';   // texto oscuro
        break;

      case 'aceptado':
        fondo = '#f4d06f';   // verde claro
        texto = '#000000';   // texto oscuro
        break;

      case 'rechazado':
        fondo = '#ff8c8c';   // rojo claro
        texto = '#000000';   // texto oscuro
        break;

      case 'cancelado':
        fondo = '#9ab0c7';   // celeste grisáceo (claro)
        texto = '#000000';   // texto oscuro
        break;

      case 'finalizado':
        fondo = '#a3d977';   // azul (oscuro)
        texto = '#000000';   // texto blanco
        break;

      default:
        fondo = 'transparent';
        texto = 'inherit';
        break;
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', fondo);
    this.renderer.setStyle(this.el.nativeElement, 'color', texto);
  }
}
