<script setup lang="ts">
import { ref } from 'vue';
const checkbox = ref(true);
import axios, { AxiosError } from 'axios';
import { useRouter } from 'vue-router'; // Importar useRouter

// Inicializar el router
const router = useRouter();
const user = ref({
  name: '',
  lastName: '',
  password: '',
  email: '',
  role: ''
});
// Variables reactivas para los campos del formulario
const valid = ref(false);

// Variable reactiva para el tipo de campo de contraseña
const showPassword = ref(false);

// Reglas de validación
const nameRules = [
  (value: string) => !!value || 'El nombre es obligatorio.'
];

const lastnameRules = [
  (value: string) => !!value || 'El apellido es obligatorio.'
];

const emailRules = [
  (value: string) => !!value || 'El correo electrónico es obligatorio.',
  (value: string) => /.+@.+\..+/.test(value) || 'El correo electrónico debe ser válido.',
];

const passwordRules = [
  (value: string) => !!value || 'La contraseña es obligatoria.',
  (value: string) => (value?.length >= 6) || 'La contraseña debe tener al menos 6 caracteres.',
];

const roleRules = [
  (value: string) => !!value || 'La ocupación es obligatoria.',
];

const error = ref<string | null>(null);

// Método para registrar usuario
const registerNewUser = async () => {
    if (valid.value) {
        try {
        const response = await axios.post('http://localhost:3000/users', user.value);
        console.log('Usuario registrado:', response.data);
    
        // Redirigir a la página de inicio si la solicitud es exitosa
        router.push('/'); // Cambia la ruta según sea necesario
    
        } catch (err) {
            console.error('Error al registrar el usuario:', err);
        
            // Tipar el error como AxiosError
            const errorAxios = err as AxiosError;
        
            // Manejar el error en función del código de estado
            if (errorAxios.response && errorAxios.response.status === 409) {
            error.value = 'No se puede registrar el correo porque ya existe.';
            } else {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};
</script>

<template>
<v-form v-model="valid" @submit.prevent="registerNewUser">
    <v-row class="d-flex mb-3">
        <v-col cols="12">
            <v-alert v-if="error" type="error" dismissible>
                {{ error }}
            </v-alert>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-bold mb-1">Nombre</v-label>
            <v-text-field v-model="user.name" :rules="nameRules" variant="outlined" density="compact" color="primary" required></v-text-field>
        </v-col>
        <v-col cols="12">
            <v-label class="font-weight-bold mb-1">Apellidos</v-label>
            <v-text-field v-model="user.lastName" :rules="lastnameRules" variant="outlined" density="compact" color="primary" required></v-text-field>
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
        <v-col cols="12">
            <v-label class="font-weight-bold mb-1">Ocupación</v-label>
            <v-select v-model="user.role" label="" :rules="roleRules" :items="['Estudiante', 'Docente', 'Reclutador']" required></v-select>
        </v-col>
        <v-col cols="12" >
            <v-btn :disabled="!valid" @click="registerNewUser" color="primary" size="large" block   flat>Registrase</v-btn>
        </v-col>
    </v-row>
</v-form>
</template>