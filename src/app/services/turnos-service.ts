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

}
