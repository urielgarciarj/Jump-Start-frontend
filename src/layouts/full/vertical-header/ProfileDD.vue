<script setup lang="ts">
import { profileDD } from '@/_mockApis/headerData';
import { useAuthStore } from '@/stores/auth';
import { useJwt } from '@vueuse/integrations/useJwt';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const token = sessionStorage.getItem('access_token');
console.log('token',token)

const encodedJwt = ref(token);  // Usamos ref para almacenar el token
console.log('encodedJwt', encodedJwt)
// Usamos useJwt para obtener el header y el payload
const { header, payload } = useJwt(encodedJwt);

// // Asegúrate de ver los valores en consola si el token es válido
console.log('header', header.value);
console.log('payload', payload.value);
const user = payload.value;

const logOut = async () => {
    sessionStorage.removeItem('access_token');
    authStore.logout();
}
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- notifications DD -->
    <!-- ---------------------------------------------- -->
    <v-menu open-on-hover open-on-click >
        <template v-slot:activator="{ props }">
            <v-btn variant="text" class="custom-hover-primary" color="primary" v-bind="props" icon>
                <v-avatar size="40" color="error" variant="flat" class="text-h5 font-weight-medium"> C </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="280" elevation="10">
            <div class="pa-6">
                <div class="d-flex align-center pb-6">
                    <v-avatar size="55" color="error" variant="flat" class="text-h5 font-weight-medium"> C </v-avatar>
                    <div class="ml-3">
                        <h6 class="text-subtitle-1 mb-n1">David McMichael <span class="text-success text-caption">Pro</span></h6>
                        <span class="text-subtitle-1 text-textSecondary">{{ user.email }}</span>
                    </div>
                </div>
                <v-divider></v-divider>
                <perfect-scrollbar style="height: calc(100vh - 240px); max-height: 240px">
                <v-list class="py-0 theme-list mt-3" lines="one">
                    <!-- <v-list-item v-for="item in profileDD" :key="item.title" class="py-0 px-2 rounded-md custom-text-primary" color="primary"  :to="item.href">
                        <div class="d-flex gap-3 align-center">
                            <p class="text-subtitle-1 heading custom-title">{{ item.title }}</p>
                        </div>
                    </v-list-item> -->
                    <v-list-item class="py-0 px-2 rounded-md custom-text-primary" color="primary">
                        <div class="d-flex gap-3 align-center">
                            <p class="text-subtitle-1 heading custom-title">Mi Perfil</p>
                        </div>
                    </v-list-item>
                    <v-list-item class="py-0 px-2 rounded-md custom-text-primary" color="primary">
                        <div class="d-flex gap-3 align-center">
                            <v-btn @click="logOut" variant="tonal" color="primary" class="text-subtitle-1 heading custom-title">Cerrar Sesión</v-btn>
                        </div>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
            </div>
        </v-sheet>
    </v-menu>
</template>
