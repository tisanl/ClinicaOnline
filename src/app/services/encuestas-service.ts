import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface Encuesta {
  id: string | null;
  created_at: string | null;
  id_turno: string;
  atencion: string;
  puntualidad: string;
  resolucion: string;
}

@Injectable({
  providedIn: 'root',
})
export class EncuestasService {
  constructor(private db: SupabaseService) { }

  async insert(encuesta: Encuesta) {
    const { data, error } = await this.db.cliente
      .from('encuestas')
      .insert([{
        id_turno: encuesta.id_turno,
        atencion: encuesta.atencion,
        puntualidad: encuesta.puntualidad,
        resolucion: encuesta.resolucion,
      }])
      .select()
      .single();

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    return data;
  }
}
