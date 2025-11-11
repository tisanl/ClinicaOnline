import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UsuarioService } from '../services/usuario-service';

export const noSessionGuard: CanMatchFn = (route, segments) => {
  const u = inject(UsuarioService);
  const router = inject(Router);

  if(u.user)
    return true;

  return router.navigate(['landingPage']);
};
