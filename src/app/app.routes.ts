import { Routes } from '@angular/router';
import { sessionGuard } from './guards/session-guard';
import { perfilGuard } from './guards/perfiles-guard';
import { noSessionGuard } from './guards/no-session-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/landingPage', pathMatch: "full" },
    { path: 'landingPage', loadComponent: () =>
        import('./components/landing-page/landing-page').then(c => c.LandingPage),
        canMatch: [sessionGuard] 
    },
    { path: 'login', loadComponent: () =>
        import('./components/login/login').then(c => c.Login),
        canMatch: [sessionGuard] 
    },
    { path: 'registro', loadComponent: () =>
        import('./components/registro/registro').then(c => c.Registro),
        canMatch: [sessionGuard]
    },
    { path: 'home', loadComponent: () =>
        import('./components/home/home').then(c => c.Home),
        canMatch: [noSessionGuard],
    },
    { path: 'usuarios', loadComponent: () =>
        import('./components/usuarios/usuarios').then(c => c.Usuarios),
        canMatch: [perfilGuard],
        data: { perfiles: ['admin'] },
    },
    { path: 'registro-admin', loadComponent: () =>
        import('./components/registro-admin/registro-admin').then(c => c.RegistroAdmin),
        canMatch: [perfilGuard],
        data: { perfiles: ['admin'] },
    },    
    { path: 'mi-perfil', loadComponent: () =>
        import('./components/mi-perfil/mi-perfil').then(c => c.MiPerfil),
        canMatch: [noSessionGuard],
    },
    { path: 'sacar-turno', loadComponent: () =>
        import('./components/sacar-turno/sacar-turno').then(c => c.SacarTurno),
        canMatch: [perfilGuard],
        data: { perfiles: ['admin', 'paciente'] },
    },
    { path: 'mis-turnos', loadComponent: () =>
        import('./components/mis-turnos/mis-turnos').then(c => c.MisTurnos),
        canMatch: [noSessionGuard],
    },
    { path: '**', loadComponent: () =>
        import('./components/landing-page/landing-page').then(c => c.LandingPage),
    },
];
