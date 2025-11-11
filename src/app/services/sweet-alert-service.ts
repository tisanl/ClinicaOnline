import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  showAlertSuccess(titulo: string, mensaje: string) {
    return Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensaje,
      background: '#24292e',
      color: '#B2DFDB',
      confirmButtonColor: '#009688',
      iconColor: '#FFC107'
    });
  }

  showAlertError(titulo: string, mensaje: string) {
    return Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensaje,
      background: '#24292e',
      color: '#ffb3b3',          // texto rojizo claro
      confirmButtonColor: '#d32f2f', // rojo principal
      iconColor: '#f44336'           // rojo brillante
    });
  }

  showLoading(titulo: string = 'Cargando...') {
    Swal.fire({
      title: titulo,
      background: '#24292e',
      color: '#B2DFDB',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  closeLoading() {
    Swal.close();
  }

  async confirmarAccion(titulo: string, texto: string): Promise<boolean> {
    const resultado = await Swal.fire({
      title: titulo,
      text: texto,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    return resultado.isConfirmed;
  }
}
