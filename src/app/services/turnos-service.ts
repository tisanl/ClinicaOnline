import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface Turno {
  id: string | null;
  dia: Date;
  hora: string; // formato 'HH:mm:ss'
  created_at?: string;
  id_paciente?: string | null;
  id_especialista: string;
  id_especialidad: number;
  estado: string;
  resena?: string | null;
  motivo_cancelacion?: string | null;
}

export interface TurnoNuevo {
  dia: Date;
  hora: string; // formato 'HH:mm:ss'
  created_at?: string;
  id_paciente?: string | null;
  id_especialista: string;
  id_especialidad: number;
  estado: string;
  resena?: string | null;
  motivo_cancelacion?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class TurnosService {
  constructor(private db: SupabaseService) { }

  async crearTurno(turno: TurnoNuevo): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .insert([turno]);

    if (error)
      throw new Error(error.message);

    return true;
  }

  async obtenerTurnosPorUsuario(usuarioId: string, perfil: string): Promise<Turno[]> {
    let data: any[] | null = null;
    let error: any = null;

    if (perfil === 'paciente') {
      ({ data, error } = await this.db.cliente
        .from('turnos')
        .select(`
      *,
      especialidades ( nombre ),
      id_especialista ( nombre, apellido )
    `)
        .eq('id_paciente', usuarioId));
    }
    else if (perfil === 'especialista') {
      ({ data, error } = await this.db.cliente
        .from('turnos')
        .select(`
      *,
      especialidades ( nombre ),
      id_paciente ( nombre, apellido )
    `)
        .eq('id_especialista', usuarioId));
    }
    else {
      ({ data, error } = await this.db.cliente
        .from('turnos')
        .select(`
        *,
        especialidades ( nombre ),
        id_paciente ( nombre, apellido ),
        id_especialista ( nombre, apellido )
      `));
    }

    if (error)
      throw new Error(error.message);

    return data || [];
  }

}
