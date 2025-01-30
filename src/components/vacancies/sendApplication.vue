<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
  vacant: String, // ID Vacante solicitada
});
const currUser = ref<any>(undefined);

const application = ref({
    name: '',
    email: '',
    phoneNumber: '',
    interested: '',
    proficiency: '',
    dateCreated: new Date().toISOString(),
    vacantId: props.vacant,
    userId: userId
});

const emit = defineEmits<{
  (e: 'applySaved', success: boolean): void;
}>();
const isActive = ref(false);
const error = ref<string | null>(null);
const valid = ref(false);

// Reglas de validación
const notEmptyRule = [
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];
const phoneTenDigitsRule = [
    (v: string | any[]) => !v || (v && v.length === 10) || 'El número de celular debe tener 10 dígitos'
]

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/users/user/${userId}`);
    currUser.value = response.data;
    //console.log('currUser.value', currUser.value)
    if (currUser.value) {
        application.value.name = `${currUser.value.name} ${currUser.value.lastName}`.toUpperCase();
        application.value.email = currUser.value.email;
    }
  } catch (error) {
    console.error('Error al obtener los posts:', error);
  }
});

const saveApplication = async () => {
    if (valid.value) {
        try {
            const response = await axios.post('http://localhost:3000/applications/apply', application.value);
            const isSuccess = response.status == 201 ? true : false;
            emit('applySaved', isSuccess);
            isActive.value = false; // Close dialog
            // Cleanup form
            application.value = {
                name: '', email: '', phoneNumber: '',
                interested: '', proficiency: '', dateCreated: '',
                vacantId: '', userId: ''
            }
        } catch (err) {
            console.error('Error:', err);
            // Tipar el error como AxiosError
            const errorAxios = err as AxiosError;
           // Manejar el error en función del código de estado
           if (errorAxios.response && errorAxios.response.status === 409) {
            error.value = 'Ya has enviado una solicitud para esta vacante.';
            } else {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};

</script>

<template>
    <v-form v-model="valid" @submit.prevent="saveApplication" enctype="multipart/form-data">
        <v-dialog v-model="isActive"  transition="dialog-bottom-transition" class="dialog-mw">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="w-100" v-bind="props" flat>Enviar Solicitud</v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card>
                    <v-toolbar color="primary" class="px-6">Enviar Solicitud</v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-alert v-if="error" type="error" dismissible>
                                    {{ error }}
                                </v-alert>
                            </v-col>
                            <v-col cols="12">
                                <span class="h4">{{ currUser?.name.toUpperCase() }} {{ currUser?.lastName.toUpperCase() }}</span>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="application.email" :rules="notEmptyRule" label="Correo" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="application.phoneNumber" :rules="phoneTenDigitsRule" label="Número Celular" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="application.interested" :rules="notEmptyRule" label="¿Por qué me interesa?" required></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="application.proficiency" :rules="notEmptyRule" label="Mis Habilidades" required></v-textarea>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="tonal" @click="isActive.value = false" flat>Cancelar</v-btn>
                        <v-btn :disabled="!valid" color="primary" variant="tonal" @click="saveApplication" flat>Guardar</v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>
