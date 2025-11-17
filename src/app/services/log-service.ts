import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface Log {
  id: string | null;
  created_at: string | null;
  id_usuario: string;
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private db: SupabaseService) { }

  async insert(id_usuario: string) {
    const { data, error } = await this.db.cliente
      .from('log_usuarios')
      .insert({ id_usuario })
      .select()
      .single();

    if (error)
      throw new Error(error.message);

    return data;
  }
}
