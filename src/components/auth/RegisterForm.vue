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
<v-form v-model="valid" @submit.prevent="registerNewUser" class="auth-form-modern">
    <div class="form-content">
        <v-alert 
            v-if="error" 
            type="error" 
            dismissible 
            class="alert-modern mb-4"
            variant="tonal"
        >
            {{ error }}
        </v-alert>
        
        <v-row class="ma-0">
            <v-col cols="12" md="6" class="pa-0 pr-md-2">
                <div class="form-field-wrapper">
                    <v-label class="form-label">Nombre</v-label>
                    <v-text-field 
                        v-model="user.name" 
                        :rules="nameRules" 
                        variant="outlined" 
                        density="comfortable" 
                        color="primary" 
                        required
                        class="form-input-modern"
                        prepend-inner-icon="mdi-account-outline"
                        placeholder="Tu nombre"
                    ></v-text-field>
                </div>
            </v-col>
            <v-col cols="12" md="6" class="pa-0 pl-md-2">
                <div class="form-field-wrapper">
                    <v-label class="form-label">Apellidos</v-label>
                    <v-text-field 
                        v-model="user.lastName" 
                        :rules="lastnameRules" 
                        variant="outlined" 
                        density="comfortable" 
                        color="primary" 
                        required
                        class="form-input-modern"
                        prepend-inner-icon="mdi-account-outline"
                        placeholder="Tus apellidos"
                    ></v-text-field>
                </div>
            </v-col>
        </v-row>
        
        <div class="form-field-wrapper">
            <v-label class="form-label">Correo electrónico</v-label>
            <v-text-field 
                v-model="user.email" 
                :rules="emailRules"  
                variant="outlined" 
                density="comfortable" 
                type="email" 
                color="primary" 
                required
                class="form-input-modern"
                prepend-inner-icon="mdi-email-outline"
                placeholder="tu@correo.com"
            ></v-text-field>
        </div>
        
        <div class="form-field-wrapper">
            <v-label class="form-label">Contraseña</v-label>
            <v-text-field
                v-model="user.password"
                :rules="passwordRules"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                color="primary"
                required
                class="form-input-modern"
                prepend-inner-icon="mdi-lock-outline"
                placeholder="••••••••"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
            ></v-text-field>
        </div>
        
        <div class="form-field-wrapper">
            <v-label class="form-label">Ocupación</v-label>
            <v-select 
                v-model="user.role" 
                :rules="roleRules" 
                :items="['Estudiante', 'Docente', 'Reclutador']" 
                required
                variant="outlined"
                density="comfortable"
                color="primary"
                class="form-input-modern"
                prepend-inner-icon="mdi-briefcase-outline"
                placeholder="Selecciona tu ocupación"
            ></v-select>
        </div>
        
        <div class="form-actions">
            <v-btn 
                :disabled="!valid" 
                @click="registerNewUser" 
                color="primary" 
                size="x-large" 
                block
                class="submit-btn-modern"
            >
                <span class="btn-text">Registrarse</span>
                <template v-slot:prepend>
                    <v-icon>mdi-account-plus</v-icon>
                </template>
            </v-btn>
        </div>
    </div>
</v-form>
</template>

<style scoped>
.auth-form-modern {
    width: 100%;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.alert-modern {
    border-radius: 12px;
    border-left: 4px solid;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.form-field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 4px;
}

.form-input-modern :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.form-input-modern :deep(.v-field--focused) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.form-input-modern :deep(.v-field__input) {
    padding: 12px 16px;
    font-size: 0.95rem;
}

.form-input-modern :deep(.v-field__prepend-inner) {
    padding-right: 12px;
    color: rgb(99, 102, 241);
}

.form-input-modern :deep(.v-field__append-inner) {
    padding-left: 8px;
    color: #64748b;
    cursor: pointer;
    transition: color 0.2s ease;
}

.form-input-modern :deep(.v-field__append-inner:hover) {
    color: rgb(99, 102, 241);
}

.form-input-modern :deep(.v-select__selection) {
    margin-left: 0;
}

.form-actions {
    margin-top: 8px;
}

.submit-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.submit-btn-modern:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.submit-btn-modern:active:not(:disabled) {
    transform: translateY(0);
}

.submit-btn-modern:disabled {
    opacity: 0.6;
    box-shadow: none;
}

.btn-text {
    font-size: 1rem;
    font-weight: 600;
}

@media screen and (max-width: 960px) {
    .form-content :deep(.v-col) {
        padding-left: 0 !important;
        padding-right: 0 !important;
    }
}
</style>