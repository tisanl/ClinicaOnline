import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario-service';
import { SweetAlertService } from '../../services/sweet-alert-service';
import { TurnosService } from '../../services/turnos-service';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, MatSortModule, MatTableModule],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css',
})
export class MisTurnos implements OnInit {
  public turnos: any[] = [];
  public displayedColumns: string[] = ['especialidad', 'especialista', 'dia', 'acciones'];
  public dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private u: UsuarioService, private sa: SweetAlertService, private t: TurnosService) { }

  async ngOnInit() {
    this.sa.showLoading();

    if(this.u.userData!.perfil == 'paciente') this.displayedColumns = ['especialidad', 'especialista', 'dia', 'acciones'];
    else if(this.u.userData!.perfil == 'especialista') this.displayedColumns = ['especialidad', 'paciente', 'dia', 'acciones'];
    else this.displayedColumns = ['especialidad', 'especialista', 'paciente', 'dia', 'acciones'];

    this.turnos = await this.t.obtenerTurnosPorUsuario(this.u.userId!, this.u.userData!.perfil);

    this.dataSource.data = this.turnos;
    console.log(this.turnos)
    this.sa.closeLoading();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;

    this.dataSource.sortingDataAccessor = (item, property) => {
    switch (property) {
      case 'especialidad':
        return item.especialidades?.nombre || '';
      case 'especialista':
        return `${item.id_especialista?.apellido || ''} ${item.id_especialista?.nombre || ''}`;
      default:
        return (item as any)[property] ?? '';
    }
  };
  }

  verDetalle(turno: any) {
    console.log('Ver detalle', turno);
  }

  cancelarTurno(turno: any) {
    console.log('Cancelar', turno);
  }
}
