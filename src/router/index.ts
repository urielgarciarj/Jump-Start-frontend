import { createRouter, createWebHistory } from 'vue-router';
import MainRoutes from './MainRoutes';
import AuthRoutes from './AuthRoutes';
import { useAuthStore } from '@/stores/auth';

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/:pathMatch(.*)*',
            component: () => import('@/views/authentication/Error.vue')
        },
        MainRoutes,
        AuthRoutes
    ]
});
router.beforeEach(async (to, from, next) => {
    // Define las rutas públicas donde no se requiere autenticación
    const publicPages = ['/auth/login', '/auth/register'];
    const authRequired = !publicPages.includes(to.path);
    const auth = useAuthStore();  // Obtiene el store de autenticación
  
    // console.log('Ruta:', to.fullPath);
    // console.log('Requiere autenticación:', authRequired);
    // console.log('Token:', auth.token);  // Verifica si el token está presente
  
    // Verifica si la ruta requiere autenticación
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      //console.log('Requiere autenticación');
  
      // Si la ruta requiere autenticación y no hay un token, redirige al login
      if (authRequired && !auth.token) {
        //console.log('No hay token, redirigiendo al login...');
        //auth.returnUrl = to.fullPath;  // Guarda la URL para redirigir después del login
        return next('/auth/login');
      } else {
        //console.log('Autenticado o ruta pública');
        next();  // Si está autenticado, continua con la navegación
      }
    } else {
      // Si la ruta no requiere autenticación, permite el acceso
      //console.log('Ruta pública, accediendo directamente...');
      next();
    }
  });
  
