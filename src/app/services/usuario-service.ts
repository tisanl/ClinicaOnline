import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase-service';
import { User } from '@supabase/supabase-js';
import { EspecialidadesService } from './especialidades-service';
import { Especialidad } from './especialidades-service';
import { HorarioEspecialista, HorariosEspecialistaService } from './horarios-especialista-service';
import { LogService } from './log-service';
import { SweetAlertService } from './sweet-alert-service';

export interface UserData {
  nombre: string;
  apellido: string;
  perfil: string;
  ultima_sesion: number | null;
}

export interface Usuario {
  id: string;
  created_at: Date | null;
  email: string;
  nombre: string;
  apellido: string;
  dni: number;
  edad: number;
  obra_social: string | null;
  imagen_1_path: string | null;
  imagen_2_path: string | null;
  imagen_1_file: File | null;
  imagen_2_file: File | null;
  perfil: string;
  estado: string | null;
  historia_clinica_id: string | null;
  lista_especialidades_id: [number] | null;
  usuario_especialidad: { especialidades: Especialidad; }[] | null;
  horarios_especialista: HorarioEspecialista[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public userObservable = this.userSubject.asObservable();

  constructor(private db: SupabaseService, private e: EspecialidadesService, private he: HorariosEspecialistaService, private log: LogService, private sa: SweetAlertService) { }

  public async initAuth() {
    const { data: { session } } = await this.db.cliente.auth.getSession();

    this.userSubject.next(session?.user ?? null);

    if (session) {
      this.sa.showLoading()
      let usuario = await this.obtenerUsuarioId(session.user.id)

      const userData = new Object as UserData;
      userData.nombre = usuario!.nombre
      userData.apellido = usuario!.apellido
      userData.perfil = usuario!.perfil

      const last = session.user.user_metadata?.['ultima_sesion'] as number | undefined;
      const ochoHoras = 8 * 60 * 60 * 1000;

      if (!last || Date.now() - last >= ochoHoras) {
        await this.log.insert(session.user.id);
        userData.ultima_sesion = Date.now();
      }
      
      console.log(session.user.user_metadata)
      await this.db.cliente.auth.updateUser({ data: userData });
    }

    this.sa.closeLoading()

    return session?.user ?? null
  }

  async login(email: string, password: string) {
    const usuario = await this.obtenerClienteMail(email)

    if (!usuario)
      throw new Error('Correo no registrado.')

    if (usuario.perfil == 'especialista') {
      if (usuario.estado == 'pendiente_validacion')
        throw new Error('Tu cuenta esta pendiente de ser validada por un administrador.')
      else if (usuario.estado == 'inhabilitado')
        throw new Error('Tu cuenta fue inhabilidata por un administrador.')
    }

    const { data, error } = await this.db.cliente.auth.signInWithPassword({ email: email, password: password });

    if (error)
      switch (error.code) {
        case 'validation_failed':
          throw new Error('El mail no es valido.')
        case 'invalid_credentials':
          throw new Error('Credenciales invalidas.')
        case 'email_not_confirmed':
          throw new Error('El mail no fue validado.')
        default:
          throw new Error('Ha ocurrido un error.\nIntente de nuevo más tarde');
      }

    if (data.user) {
      this.userSubject.next(data.user);
      let metadata
      metadata = await this.obtenerUsuarioId(data.user.id)
      const userData = new Object as UserData;
      userData.nombre = metadata!.nombre
      userData.apellido = metadata!.apellido
      userData.perfil = metadata!.perfil

      const last = data.user.user_metadata?.['ultima_sesion'] as number | undefined;
      const ochoHoras = 8 * 60 * 60 * 1000;

      if (!last || Date.now() - last >= ochoHoras) {
        await this.log.insert(data.user.id);
        userData.ultima_sesion = Date.now();
      }

      await this.db.cliente.auth.updateUser({ data: userData });
    }

    return true
  }

  async logout() {
    const { error } = await this.db.cliente.auth.signOut();
    console.log('Se cerro la sesion')

    if (error)
      throw new Error(error.message);

    this.userSubject.next(null)
  }

  async registrar(email: string, password: string, usuario: Usuario) {
    const mailRegistrado = await this.emailYaRegistrado(email)
    if (mailRegistrado) throw new Error('Usuario ya registrado');

    const userData = new Object as UserData;
    userData.nombre = usuario.nombre
    userData.apellido = usuario.apellido
    userData.perfil = usuario.perfil

    let authResult;

    authResult = await this.db.cliente.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    const { data, error } = authResult

    if (error)
      switch (error.code) {
        case 'weak_password':
          throw new Error('La contraseña debe tener al menos 6 caracteres.');
        case 'validation_failed':
          throw new Error('El mail no es válido.');
        case 'over_email_send_rate_limit':
          throw new Error('Ha intentado muchas veces.\nIntente de nuevo más tarde');
        case 'user_already_registered': // también puede venir como 'email_exists'
        case 'email_exists':
          throw new Error('Usuario ya registrado.');
        default:
          //throw new Error('Ha ocurrido un error.\nIntente de nuevo más tarde');
          throw new Error(error.message);
      }

    usuario.id = data.user!.id
    if (usuario.perfil == 'especialista') usuario.estado = 'pendiente_validacion'
    await this.guardarBD(usuario)
    if (usuario.perfil == 'especialista') {
      await this.e.guardarEspecialidadesUsuario(usuario.id, usuario.lista_especialidades_id!)
      await this.he.crearHorariosBaseParaEspecialista(usuario.id)
    }
    return true
  }

  private async guardarBD(usuario: Usuario) {
    let imagen1 = null;
    let imagen2 = null;

    if (usuario.imagen_1_file)
      imagen1 = await this.db.saveFile('users', usuario.imagen_1_file)

    if (usuario.imagen_2_file)
      imagen2 = await this.db.saveFile('users', usuario.imagen_2_file)

    const { error } = await this.db.cliente.from('usuarios')
      .insert([{
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        edad: usuario.edad,
        obra_social: usuario.obra_social,
        imagen_1_path: imagen1?.path,
        imagen_2_path: imagen2?.path,
        perfil: usuario.perfil,
        estado: usuario.estado,
        historia_clinica_id: usuario.historia_clinica_id,
      }]);

    if (error)
      throw new Error('Problema accediendo a la base de datos');
  }

  async emailYaRegistrado(email: string) {
    const { data, error } = await this.db.cliente.from('usuarios').select('id').eq('email', email).maybeSingle();

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    else if (data === null)
      return false

    return true
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get userId(): string | null {
    return this.userSubject.value ? this.userSubject.value.id : null;
  }

  get userData(): UserData | null {
    if (this.userSubject.value)
      return this.user!.user_metadata as UserData;

    return null;
  }

  get userEmail(): string | null {
    if (this.user)
      return this.user.email!;

    return null;
  }

  async obtenerUsuarioId(id: string): Promise<Usuario | null> {
    const { data, error } = await this.db.cliente
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error('Problema accediendo a la base de datos');

    return data ?? null;
  }

  async obtenerClienteMail(email: string) {
    const { data, error } = await this.db.cliente.from('usuarios').select('*').eq('email', email).maybeSingle();

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    else if (data === null)
      return false

    return data as Usuario | null;
  }

  async obtenerEspecialistas(): Promise<(Usuario & { especialidades: Especialidad[] })[]> {
    const { data, error } = await this.db.cliente
      .from('usuarios')
      .select(`
      *,
      usuario_especialidad (
        especialidades (
          id,
          nombre
        )
      )
    `)
      .eq('perfil', 'especialista');

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    return (data || []).map((u: any) => ({
      ...u,
      imagen_1_path: u.imagen_1_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_1_path).data.publicUrl
        : null,
      especialidades: (u.usuario_especialidad || []).map((eu: any) => eu.especialidades) as Especialidad[],
    }));
  }

  async modificarEstadoUsuario(id: string, nuevoEstado: string) {
    const { error } = await this.db.cliente
      .from('usuarios')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error)
      throw new Error('No se pudo modificar el estado del usuario.');
  }

  async obtenerUsuarios(): Promise<(Usuario & { especialidades: Especialidad[] })[]> {
    const { data, error } = await this.db.cliente
      .from('usuarios')
      .select(`
      *,
      usuario_especialidad (
        especialidades (
          id,
          nombre
        )
      )
    `);

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    return (data || []).map((u: any) => ({
      ...u,
      imagen_1_path: u.imagen_1_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_1_path).data.publicUrl
        : null,
      magen_2_path: u.imagen_2_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_2_path).data.publicUrl
        : null,
    }));
  }

  async obtenerUsuarioPorId(id: string): Promise<Usuario & { especialidades: Especialidad[]; horarios: HorarioEspecialista[]; }> {
    const { data, error } = await this.db.cliente
      .from('usuarios')
      .select(`
      *,
      usuario_especialidad (
        especialidades (
          id,
          nombre
        )
      ),
      horarios_especialista (
        id,
        dia_semana,
        hora_inicio,
        hora_fin,
        activo
      )
    `)
      .eq('id', id)
      .single();

    if (error)
      throw new Error('Problema accediendo a la base de datos');

    const u = data;

    return {
      ...u,
      horarios_especialista: u.perfil === 'especialista'
        ? (u.horarios_especialista as HorarioEspecialista[]).sort(
          (a: HorarioEspecialista, b: HorarioEspecialista) => a.dia_semana - b.dia_semana
        )
        : u.horarios_especialista,
      imagen_1_path: u.imagen_1_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_1_path).data.publicUrl
        : null,
      imagen_2_path: u.imagen_2_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_2_path).data.publicUrl
        : null,
    };
  }

  async obtenerUsuariosEspecialistasPorEspecialidad(idEspecialidad: number): Promise<Usuario[]> {
    const { data, error } = await this.db.cliente
      .from('usuarios')
      .select(`
      *,
      horarios_especialista(*),
      usuario_especialidad!inner (
        especialidad_id
      )
    `)
      .eq('perfil', 'especialista')
      .eq('estado', 'habilitado')
      .eq('usuario_especialidad.especialidad_id', idEspecialidad);

    if (error)
      throw new Error(error.message);

    return (data || []).map((u: any) => ({
      ...u,
      horarios_especialista: Array.isArray(u.horarios_especialista)
        ? (u.horarios_especialista as HorarioEspecialista[]).sort(
          (a, b) => a.dia_semana - b.dia_semana
        )
        : [],
      imagen_1_path: u.imagen_1_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_1_path).data.publicUrl
        : null,
    }));
  }

  async obtenerUsuariosPacientes(): Promise<Usuario[]> {
    const { data, error } = await this.db.cliente
      .from('usuarios')
      .select(`*`)
      .eq('perfil', 'paciente');

    if (error) throw new Error('Problema accediendo a la base de datos');

    return data.map(u => ({
      ...u,
      imagen_1_path: u.imagen_1_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_1_path).data.publicUrl
        : null,
      imagen_2_path: u.imagen_2_path
        ? this.db.cliente.storage.from('images').getPublicUrl(u.imagen_2_path).data.publicUrl
        : null,
    }));
  }
}
