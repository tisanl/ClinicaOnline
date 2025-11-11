import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideAppInitializer, inject } from '@angular/core';
import { UsuarioService } from './app/services/usuario-service';

bootstrapApplication(App, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    provideAppInitializer(() => {
      const u = inject(UsuarioService);
      return u.initAuth(); // espera a que se cargue la sesión antes de arrancar la app
    }),
  ],
}).catch(err => console.error(err));
