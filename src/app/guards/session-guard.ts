import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UsuarioService } from '../services/usuario-service';

export const sessionGuard: CanMatchFn = () => {
  const u = inject(UsuarioService);
  const router = inject(Router);

  if(u.user)
    return router.navigate(['home']);

  return true
};