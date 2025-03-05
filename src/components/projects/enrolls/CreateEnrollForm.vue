<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
  project: Number, // ID Proyecto solicitado
});

const currUser = ref<any>(undefined);
const enrollID = ref<any>(undefined); // save enroll ID if exists
const emit = defineEmits<{
    (e: 'enrollSaved', success: boolean): void;
    (e: 'enrollDeleted', success: boolean): void;
}>();

const enroll = ref({
    name: '',
    comments: '',
    status: 'Pendiente',
    dateCreated: new Date().toISOString(),
    projectId: props.project,
    userId: userId
});
const isActive = ref(false);
const error = ref<string | null>(null);
const valid = ref(false);
const hasSubmitted = ref(false);
const showConfirmation = ref(false);
const notEmptyRule = [ // Reglas de validación
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];

// usamos watch en lugar de onMounted para esperar los props
watch([() => authStore.userId, () => props.project], async ([userId, project_id]) => {
  try {
    const response = await axios.get(`http://localhost:3000/enrolls/find-by/user-project/${userId}/${project_id}`);
    if (response.data) { 
        hasSubmitted.value = true;
        enroll.value = { ...enroll.value, ...response.data };
        enrollID.value = response.data.id; // Saves the ID of the enroll
    }
    else {
        hasSubmitted.value = false;
        enroll.value.projectId = project_id;
        const userResponse = await axios.get(`http://localhost:3000/users/user/${userId}`);
        currUser.value = userResponse.data;
        if (currUser.value) {
            enroll.value.name = `${currUser.value.name} ${currUser.value.lastName}`.toUpperCase();
        }
    }
  } catch (err) {
    console.error('Error al obtener los proyecto-usuario:', err);
    const errorAxios = err as AxiosError;
    if (errorAxios.response) {
        error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
});

const submitEnroll = async () => {
    if (valid.value) {
        try {
            const response = await axios.post('http://localhost:3000/enrolls/enroll', enroll.value);
            const isSuccess = response.status == 201 ? true : false;
            hasSubmitted.value = true;
            isActive.value = false; // Close dialog
            enroll.value = response.data;
            enrollID.value = response.data.id;
            emit('enrollSaved', isSuccess);
        } catch (err) {
            console.error('Error:', err);
            // Tipar el error como AxiosError
            const errorAxios = err as AxiosError;
            if (errorAxios.response) {
                error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};

// Formatting Functions
const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
    'Aceptado': 'success',
    'Rechazado': 'error'
    };
    return statusColors[status] || 'info';
};
const formatDateTime = (date: string) => {
  if (!date) return 'Indefinido';
  return new Date(date).toLocaleString('es-ES', {
    day: 'numeric',    // Día
    month: 'numeric',  // Mes
    year: 'numeric',   // Año
  });
};
const capitalizeFirstLetter = (str: string) => {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
</script>

<template>
    <v-form v-model="valid" @submit.prevent="submitEnroll">
        <v-dialog v-model="isActive"  transition="dialog-bottom-transition" class="dialog-mw">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="w-100" v-bind="props" flat>{{ hasSubmitted ? 'Ver Mi Solicitud' : 'Solicitar Participar' }}</v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card>
                    <v-toolbar color="primary" class="px-6">Solicitud de Participación</v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-alert v-if="error" type="error" dismissible>
                                    {{ error }}
                                </v-alert> 
                                <v-alert v-if="!hasSubmitted" type="info" variant="tonal" class="mb-3">
                                    Completa tu solicitud de forma concisa. No podrás editarla una vez enviada, pero sí consultarla o eliminarla. El envío no garantiza la participación; el docente debe aprobarla.
                                </v-alert>
                            </v-col>
                            <v-col cols="12">
                                <span v-if="!hasSubmitted" class="h4">{{ currUser?.name.toUpperCase() }} {{ currUser?.lastName.toUpperCase() }}</span>
                                <span v-else class="font-weight-semibold">{{ enroll.name }}</span>
                            </v-col>

                            <v-col cols="12" md="6" v-if="hasSubmitted">
                                <span class="font-weight-semibold">Fecha: {{ formatDateTime(enroll.dateCreated) }}</span>
                            </v-col>
                            <v-col cols="12" md="6" v-if="hasSubmitted">
                                <span class="font-weight-semibold">Estado:</span>
                                <v-chip class="font-weight-bold bg-light" :color="getStatusColor(enroll.status)" size="small" rounded="sm">
                                    {{ capitalizeFirstLetter(enroll?.status || '') }}
                                </v-chip>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-if="!hasSubmitted" v-model="enroll.comments" :rules="notEmptyRule" label="Comentarios" required></v-textarea>
                                <div v-else class="bg-light mt-4 pa-4 rounded-md">
                                    <span class="font-weight-semibold">Comentarios</span><br/>
                                    <span class="v-text">{{ enroll.comments }}</span>
                                </div>
                            </v-col> 
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="tonal" @click="isActive.value = false" flat>{{ hasSubmitted ? 'Cerrar' : 'Cancelar' }}</v-btn>
                        <v-btn v-if="!hasSubmitted" :disabled="!valid" color="primary" variant="tonal" @click="submitEnroll" flat>Guardar</v-btn> 
                        <v-btn v-if="hasSubmitted" color="error" variant="tonal" @click="" flat>
                            Eliminar Solicitud
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>
