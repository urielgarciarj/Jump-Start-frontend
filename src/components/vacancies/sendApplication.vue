<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
  vacant: Number, // ID Vacante solicitada
});
const currUser = ref<any>(undefined);
const applicationId = ref<any>(undefined); // save apply ID if exists

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
  (e: 'applyDeleted', success: boolean): void;
}>();
const isActive = ref(false);
const error = ref<string | null>(null);
const valid = ref(false);
const hasSubmitted = ref(false);
const showConfirmation = ref(false);

// Reglas de validación
const notEmptyRule = [
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];
const phoneTenDigitsRule = [
    (v: string | any[]) => {
    const value = Array.isArray(v) ? v.join('') : v; // Si v es un array, lo convertimos a string
    return !value || (/^\d{10}$/.test(value)) || 'El número de celular debe tener 10 dígitos y solo números';
  }
]

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/applications/find-by/user-vacant/${userId}/${ props.vacant}`);
    if (response.data) { 
        hasSubmitted.value = true;
        application.value = response.data;
        applicationId.value = response.data.id; // Saves the ID of the application
    }
    else {
        hasSubmitted.value = false;
        const userResponse = await axios.get(`http://localhost:3000/users/user/${userId}`);
        currUser.value = userResponse.data;
        //console.log('currUser.value', currUser.value)
        if (currUser.value) {
            application.value.name = `${currUser.value.name} ${currUser.value.lastName}`.toUpperCase();
            application.value.email = currUser.value.email;
        }
    }
  } catch (err) {
    console.error('Error al obtener los posts:', err);
    const errorAxios = err as AxiosError;
    if (errorAxios.response) {
        error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
});

const saveApplication = async () => {
    if (valid.value) {
        try {
            const response = await axios.post('http://localhost:3000/applications/apply', application.value);
            const isSuccess = response.status == 201 ? true : false;
            hasSubmitted.value = true;
            isActive.value = false; // Close dialog
            application.value = { // Cleanup form
                name: '', email: '', phoneNumber: '', interested: '', proficiency: '', dateCreated: '',
                vacantId: 0, userId: ''
            }
            emit('applySaved', isSuccess);
        } catch (err) {
            console.error('Error:', err);
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

//Funcion para manejar eliminar una vacante
const handleDeleteApplication = () => { 
    showConfirmation.value = true; 
};

const confirmDelete = async () => {
    try {
        if (applicationId.value) {
            const response = await axios.delete(`http://localhost:3000/applications/delete/${applicationId.value}`);
            //console.log('Solicitud eliminada, response:', response.status);
            const isSuccess = response.status == 200 ? true : false;
            applicationId.value = undefined;
            showConfirmation.value = false;
            hasSubmitted.value = false;
            isActive.value = false; // Close dialog
            emit('applyDeleted', isSuccess);
        } else {
            console.error('No se puede eliminar, la solicitud no tiene ID');
        }
    } catch (err) {
            console.error('Error:', err);
            const errorAxios = err as AxiosError;
           // Manejar el error en función del código de estado
            if (errorAxios.response) {
                error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
};
</script>

<template>
    <v-form v-model="valid" @submit.prevent="saveApplication" enctype="multipart/form-data">
        <v-dialog v-model="isActive"  transition="dialog-bottom-transition" class="dialog-mw">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="w-100" v-bind="props" flat>{{ hasSubmitted ? 'Ver Solicitud' : 'Enviar Solicitud' }}</v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card>
                    <v-toolbar color="primary" class="px-6">{{ hasSubmitted ? 'Solicitud Enviada' : 'Enviar Solicitud' }}</v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-alert v-if="error" type="error" dismissible>
                                    {{ error }}
                                </v-alert>
                            </v-col>
                            <v-col cols="12">
                                <span v-if="!hasSubmitted" class="h4">{{ currUser?.name.toUpperCase() }} {{ currUser?.lastName.toUpperCase() }}</span>
                                <span v-else class="v-text">{{ application.name }}</span>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-if="!hasSubmitted" v-model="application.email" :rules="notEmptyRule" label="Correo Electrónico" required></v-text-field>
                                <div v-else class="bg-light mt-4 pa-4 rounded-md">
                                    <span class="font-weight-semibold">Correo Electrónico</span><br/>
                                    <span class="v-text">{{ application.email }}</span>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-if="!hasSubmitted" v-model="application.phoneNumber" :rules="phoneTenDigitsRule" label="Número Celular" required></v-text-field>
                                <div v-else class="bg-light mt-4 pa-4 rounded-md">
                                    <span class="font-weight-semibold">Número de celular</span><br/>
                                    <span class="v-text">{{ application.phoneNumber }}</span>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-if="!hasSubmitted" v-model="application.interested" :rules="notEmptyRule" label="¿Por qué me interesa?" required></v-textarea>
                                <div v-else class="bg-light mt-4 pa-4 rounded-md">
                                    <span class="font-weight-semibold">¿Por qué me interesa?</span><br/>
                                    <span class="v-text">{{ application.interested }}</span>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-if="!hasSubmitted" v-model="application.proficiency" :rules="notEmptyRule" label="Mis Habilidades" required></v-textarea>
                                <div v-else class="bg-light mt-4 pa-4 rounded-md">
                                    <span class="font-weight-semibold">Mis Habilidades</span><br/>
                                    <span class="v-text">{{ application.proficiency }}</span>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="tonal" @click="isActive.value = false" flat>{{ hasSubmitted ? 'Cerrar' : 'Cancelar' }}</v-btn>
                        <v-btn v-if="!hasSubmitted" :disabled="!valid" color="primary" variant="tonal" @click="saveApplication" flat>Guardar</v-btn>
                        <v-btn v-if="hasSubmitted" color="error" variant="tonal" @click="handleDeleteApplication" flat>
                            Eliminar Solicitud
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>

    <!-- Confirmation Dialog Delete Application-->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Solicitud</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar tu solicitud para esta oferta laboral?</h5>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="tonal" class="px-4" @click="showConfirmation = false">Cancelar</v-btn>
                <v-btn color="error" class="px-4" variant="tonal" @click="confirmDelete">Si, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
