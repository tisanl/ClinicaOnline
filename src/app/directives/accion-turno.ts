import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface AccionTurnoConfig {
  accion: string;
  perfil: string;
  turno: any;
}

@Directive({
  selector: '[accionTurno]'
})
export class AccionTurno {
  private config?: AccionTurnoConfig;
  private hasView = false;

  constructor( private tpl: TemplateRef<any>, private vcr: ViewContainerRef ) { }

  @Input('accionTurno')
  set accionTurnoConfig(value: AccionTurnoConfig | null) {
    this.config = value || undefined;
    this.updateView();
  }

  private updateView() {
    if (!this.config) {
      this.clearView();
      return;
    }

    const mostrar = this.debeMostrar(this.config);

    if (mostrar && !this.hasView) {
      this.vcr.createEmbeddedView(this.tpl);
      this.hasView = true;
    } else if (!mostrar && this.hasView) {
      this.clearView();
    }
  }

  private clearView() {
    this.vcr.clear();
    this.hasView = false;
  }

  private debeMostrar(cfg: AccionTurnoConfig): boolean {
    const { accion, perfil, turno } = cfg;
    const estado = turno?.estado;

    switch (accion) {
      case 'cancelar':
        return estado === 'pendiente' || estado === 'aceptado';

      case 'aceptar':
        return perfil === 'especialista' && estado === 'pendiente';

      case 'rechazar':
        return perfil === 'especialista' && estado === 'pendiente';

      case 'finalizar':
        return perfil === 'especialista' && estado === 'aceptado';

      case 'calificarAtencion':
        return perfil === 'paciente' && estado === 'finalizado';

      case 'responderEncuesta':
        return (
          perfil === 'paciente' &&
          estado === 'finalizado' &&
          !turno?.encuesta &&
          !!turno?.resena
        );

      case 'sinAcciones':
        return !(
          (estado === 'pendiente' || estado === 'aceptado') ||
          (perfil === 'especialista' && (estado === 'pendiente' || estado === 'aceptado')) ||
          (perfil === 'paciente' && estado === 'finalizado')
        );

      default:
        return false;
    }
  }
}
