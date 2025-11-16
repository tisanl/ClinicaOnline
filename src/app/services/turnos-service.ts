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
  motivo_rechazo?: string | null;
  calificar_atencion?: string | null;
  id_encuesta?: string | null;
  id_historia_clinica?: string | null;
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
  motivo_rechazo?: string | null;
  calificar_atencion?: string | null;
  id_encuesta?: string | null;
  id_historia_clinica?: string | null;
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
      especialidad:especialidades ( * ),
      especialista:id_especialista ( * ),
      encuesta:id_encuesta (*),
      historia_clinica:id_historia_clinica (*)
    `)
        .eq('id_paciente', usuarioId)
        .order('dia', { ascending: false })
        .order('hora', { ascending: true }));
    }
    else if (perfil === 'especialista') {
      ({ data, error } = await this.db.cliente
        .from('turnos')
        .select(`
      *,
      especialidad:especialidades ( * ),
      paciente:id_paciente ( * ),
      encuesta:id_encuesta (*),
      historia_clinica:id_historia_clinica (*)
    `)
        .eq('id_especialista', usuarioId)
        .order('dia', { ascending: false })
        .order('hora', { ascending: true }));

    }
    else {
      ({ data, error } = await this.db.cliente
        .from('turnos')
        .select(`
        *,
        especialidad:especialidades ( * ),
        paciente:id_paciente ( * ),
        especialista:id_especialista ( * ),
        encuesta:id_encuesta (*),
        historia_clinica:id_historia_clinica (*)
      `)
        .order('dia', { ascending: false })
        .order('hora', { ascending: true }));
    }

    if (error)
      throw new Error(error.message);

    return data || [];
  }

  async actualizarEstadoTurno(id: string, estado: string): Promise<boolean> {
    const { error } = await this.db.cliente.from('turnos').update({ estado }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  async actualizarTurnoCancelado(id: string, estado: string, motivo: string | null): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .update({ estado, motivo_cancelacion: motivo })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async actualizarTurnoRechazado(id: string, estado: string, motivo: string | null): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .update({ estado, motivo_rechazo: motivo })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async actualizarCalificarAtencion(id: string, calificacion: string | null): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .update({ calificar_atencion: calificacion })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async actualizarEncuesta(id: string, idEncuesta: string | null): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .update({ id_encuesta: idEncuesta })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async actualizarHistoriaClinica(id: string, idHistoriaClinica: string | null): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .update({ id_historia_clinica: idHistoriaClinica })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async actualizarTurnoFinalizado(id: string, estado: string, resena: string | undefined): Promise<boolean> {
    const { error } = await this.db.cliente
      .from('turnos')
      .update({ estado, resena: resena })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async obtenerTurnosProx15Dias(usuarioId: string, perfil: string): Promise<{ dia: string; hora: string }[]> {
    const hoy = new Date();
    const desde = new Date(hoy);
    const hasta = new Date(hoy);
    hasta.setDate(hoy.getDate() + 15);

    let id = 'id_especialista'
    if(perfil === 'paciente') id = 'id_paciente'

    const { data, error } = await this.db.cliente
      .from('turnos')
      .select('dia, hora')
      .eq(id, usuarioId)
      .gte('dia', desde.toISOString().slice(0, 10))
      .lte('dia', hasta.toISOString().slice(0, 10));

    if (error) throw new Error(error.message);
    return data ?? [];
  }

}
