import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface HorarioEspecialista {
  id: string;
  id_usuario: string;
  dia_semana: number;
  hora_inicio: string; // formato 'HH:mm:ss'
  hora_fin: string;    // formato 'HH:mm:ss'
  activo: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HorariosEspecialistaService {

  constructor(private db: SupabaseService) { }

  async crearHorariosBaseParaEspecialista(idUsuario: string | number) {
    const diasSemana = [1, 2, 3, 4, 5, 6]; // 0 = domingo, 6 = sábado (o como vos definas)

    const registros = diasSemana.map(dia => ({
      id_usuario: idUsuario,
      dia_semana: dia
    }));

    const { error } = await this.db.cliente
      .from('horarios_especialista')
      .insert(registros);

    if (error) {
      throw new Error('No se pudieron crear los horarios base del especialista');
    }
  }

  async actualizarHorariosEspecialista(horarios: HorarioEspecialista[]): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('horarios_especialista')
      .upsert(horarios);

    if (error) {
      throw new Error('No se pudieron crear los horarios base del especialista');
    }

    return !error;
  }
}
