import { defineStore } from 'pinia';
import { router } from '@/router';
import { useJwt } from '@vueuse/integrations/useJwt';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    token: sessionStorage.getItem('access_token') || null,
    user: JSON.parse(sessionStorage.getItem('user') || '{}'),
  }),
  getters: {
    // Usar useJwt para decodificar el token
    userId: (state) => {
      if (state.token) {
        const { payload } = useJwt(state.token);  // Extraemos el payload
        return payload.value ? payload.value.sub : null;  // Devuelve el ID del usuario desde el payload
      }
      return null;  // Si no hay token, devuelve null
    },
    userRole: (state) => {
      if (state.token) {
        const { payload } = useJwt(state.token);
        return payload.value ? payload.value.role : null;
      }
      return null;  // Si no hay token, devuelve null
    },
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    setToken(token: string) {
      this.token = token;
      sessionStorage.setItem('access_token', token);
      router.push('/');
    },
    logout() {
      this.token = null;
      this.user = null;
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
      router.push('/auth/login');
    },
  },
});
