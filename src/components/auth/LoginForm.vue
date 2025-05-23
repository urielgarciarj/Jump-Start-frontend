<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const user = ref({
    email: '',
    password: '',
});
const valid = ref(false);

// Variable reactiva para el tipo de campo de contraseña
const showPassword = ref(false);

// Reglas de validación
const emailRules = [
  (value: string) => !!value || 'El correo electrónico es obligatorio.',
  (value: string) => /.+@.+\..+/.test(value) || 'El correo electrónico debe ser válido.'
];

const passwordRules = [
  (value: string) => !!value || 'La contraseña es obligatoria.'
];

const error = ref<string | null>(null);

// Método para registrar usuario
const authUser = async () => {
    if (valid.value) {
        try {
            const response = await axios.post('http://localhost:3000/users/login', user.value);
            //console.log('Usuario autenticado:');
            const access_token = response.data.access_token;
            authStore.setToken(access_token);
        
        } catch (err) {
            console.error('Error al iniciar sesion:', err);
        
            // Tipar el error como AxiosError
            const errorAxios = err as AxiosError;
        
            // Manejar el error en función del código de estado
            if (errorAxios.response && errorAxios.response.status === 401) {
            error.value = 'Credenciales incorrectas';
            } else {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};
</script>

<template>
    <v-form v-model="valid" @submit.prevent="authUser">
        <v-row class="d-flex mb-3">
            <v-col cols="12">
                <v-alert v-if="error" type="error" dismissible>
                    {{ error }}
                </v-alert>
            </v-col>
            <v-col cols="12">
                <v-label class="font-weight-bold mb-1">Correo electrónico</v-label>
                <v-text-field v-model="user.email" :rules="emailRules"  variant="outlined" density="compact" type="email" color="primary" required></v-text-field>
            </v-col>
            <v-col cols="12">
            <v-label class="font-weight-bold mb-1">Contraseña</v-label>
            <v-text-field
                v-model="user.password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="compact"
                color="primary"
                required
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="showPassword = !showPassword"
            ></v-text-field>
        </v-col>
            <v-col cols="12" class="pt-0">
                <v-btn :disabled="!valid" @click="authUser" color="primary" size="large" block   flat>Iniciar Sesión</v-btn>
            </v-col>
        </v-row>
    </v-form>
</template>
