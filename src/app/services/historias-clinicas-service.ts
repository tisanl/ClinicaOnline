import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface HistoriaClinica {
  id: string | null;
  created_at: string | null;
  id_turno: string;
  altura: string;
  peso: string;
  temperatura: string;
  presion: string;
  campos_dinamicos: any;
}

@Injectable({
  providedIn: 'root',
})
export class HistoriasClinicasService {
  constructor(private db: SupabaseService) { }
  
    async insert(historiaClinica: HistoriaClinica) {
      const { data, error } = await this.db.cliente
        .from('historias_clinicas')
        .insert([{
          id_turno: historiaClinica.id_turno,
          altura: historiaClinica.altura,
          peso: historiaClinica.peso,
          temperatura: historiaClinica.temperatura,
          presion: historiaClinica.presion,
          campos_dinamicos: historiaClinica.campos_dinamicos,
        }])
        .select()
        .single();
  
      if (error)
        throw new Error(error.message);
  
      return data;
    }
}
