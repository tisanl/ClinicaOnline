import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabaseClient: SupabaseClient | null = null;

  constructor() {
    this.supabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  get cliente(): SupabaseClient {
    if (!this.supabaseClient)
      throw new Error('SupabaseClient no fue inicializado correctamente');

    return this.supabaseClient;
  }

  async saveFile(folder: string, imagen: File) {
    const { data, error } = await this.cliente
      .storage
      .from('images')
      .upload(`${folder}/${Date.now()}${imagen?.name}`, imagen!, {
        cacheControl: '3600',
        upsert: false
      });

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    return data;
  }
}
