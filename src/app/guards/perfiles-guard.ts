import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UsuarioService } from '../services/usuario-service';

export const perfilGuard: CanMatchFn = (route, segments) => {
  const u = inject(UsuarioService);
  const router = inject(Router);
  const perfilesPermitidos = route.data?.['perfiles'] as string[];

  const user = u.userData;

  if (user && perfilesPermitidos.includes(user.perfil))
    return true;

  return router.parseUrl('/home');
};