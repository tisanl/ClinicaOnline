import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface Especialidad {
  id: number;
  nombre: string;
}

export interface UsuarioEspecialidad {
  id: string;
  usuario_id: string;
  especialidad_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class EspecialidadesService {
  constructor(private db: SupabaseService) { }

  async obtenerEspecialidades(): Promise<Especialidad[]> {
    const { data, error } = await this.db.cliente
      .from('especialidades')
      .select('*')
      .order('nombre', { ascending: true });

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    return data as Especialidad[];
  }

  async guardarEspecialidad(nombreEspecialidad: string) {
    const { error } = await this.db.cliente.from('especialidades')
      .insert([{ nombre: nombreEspecialidad }]);

    if (error)
      throw new Error('Problema accediendo a la base de datos');
  }

  async guardarEspecialidadesUsuario(idUsuario: string, idsEspecialidades: number[]) {
  if (!idsEspecialidades || idsEspecialidades.length === 0) return;

  const filas = idsEspecialidades.map(idEsp => ({
    usuario_id: idUsuario,
    especialidad_id: idEsp,
  }));

  const { error } = await this.db.cliente
    .from('usuario_especialidad')
    .insert(filas);

  if (error)
    throw new Error('Problema accediendo a la base de datos');
}
}
