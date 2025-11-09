<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

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
onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/enrolls/find-by/user-project/${userId}/${props.project}`);
    if (response.data) { 
        hasSubmitted.value = true;
        enroll.value = { ...enroll.value, ...response.data };
        enrollID.value = response.data.id; // Saves the ID of the enroll
    }
    else {
        hasSubmitted.value = false;
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
        <v-dialog v-model="isActive" max-width="600" persistent>
            <template v-slot:activator="{ props }">
                <v-btn 
                    color="primary" 
                    class="w-100 enroll-btn" 
                    v-bind="props" 
                    variant="flat"
                    rounded="lg"
                    size="large"
                >
                    <Icon :icon="hasSubmitted ? 'mdi:eye-outline' : 'mdi:send-outline'" height="20" class="mr-2" />
                    {{ hasSubmitted ? 'Ver Mi Solicitud' : 'Solicitar Participar' }}
                </v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card rounded="lg" class="enroll-dialog">
                    <v-card-title class="pa-6 bg-primary text-white enroll-header">
                        <div class="d-flex align-center">
                            <div class="header-icon-wrapper mr-3">
                                <Icon icon="mdi:account-plus-outline" height="24" />
                            </div>
                            <span class="text-h6 font-weight-bold">Solicitud de Participación</span>
                        </div>
                    </v-card-title>
                    
                    <v-card-text class="pa-6">
                        <v-row>
                            <v-col cols="12">
                                <v-alert 
                                    v-if="error" 
                                    type="error" 
                                    variant="tonal"
                                    dismissible
                                    rounded="lg"
                                    class="mb-4"
                                >
                                    {{ error }}
                                </v-alert> 
                                <v-alert 
                                    v-if="!hasSubmitted" 
                                    type="info" 
                                    variant="tonal" 
                                    class="mb-4 info-alert-modern"
                                    rounded="lg"
                                >
                                    <template v-slot:prepend>
                                        <Icon icon="mdi:information-outline" height="24" />
                                    </template>
                                    <div class="font-weight-medium mb-1">Información importante</div>
                                    <div class="text-caption">
                                        Completa tu solicitud de forma concisa. No podrás editarla una vez enviada, pero sí consultarla o eliminarla. El envío no garantiza la participación; el docente debe aprobarla.
                                    </div>
                                </v-alert>
                            </v-col>
                            
                            <v-col cols="12">
                                <div class="applicant-name-section pa-4 mb-4">
                                    <Icon icon="mdi:account-circle-outline" height="20" class="mr-2" />
                                    <span v-if="!hasSubmitted" class="text-h6 font-weight-bold">
                                        {{ currUser?.name.toUpperCase() }} {{ currUser?.lastName.toUpperCase() }}
                                    </span>
                                    <span v-else class="text-h6 font-weight-bold">{{ enroll.name }}</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="6" v-if="hasSubmitted">
                                <div class="info-item pa-3">
                                    <Icon icon="mdi:calendar-outline" height="18" class="mr-2" />
                                    <span class="text-body-2"><strong>Fecha:</strong> {{ formatDateTime(enroll.dateCreated) }}</span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="6" v-if="hasSubmitted">
                                <div class="info-item pa-3">
                                    <Icon icon="mdi:information-outline" height="18" class="mr-2" />
                                    <span class="text-body-2 mr-2"><strong>Estado:</strong></span>
                                    <v-chip 
                                        class="font-weight-bold" 
                                        :color="getStatusColor(enroll.status)" 
                                        size="small" 
                                        rounded="lg"
                                    >
                                        {{ capitalizeFirstLetter(enroll?.status || '') }}
                                    </v-chip>
                                </div>
                            </v-col>
                            
                            <v-col cols="12">
                                <v-label v-if="!hasSubmitted" class="mb-2 font-weight-medium text-body-1">Comentarios</v-label>
                                <v-textarea 
                                    v-if="!hasSubmitted" 
                                    v-model="enroll.comments" 
                                    :rules="notEmptyRule" 
                                    label="Explica por qué quieres participar en este proyecto..." 
                                    required
                                    variant="outlined"
                                    rounded="lg"
                                    color="primary"
                                    rows="5"
                                    hide-details="auto"
                                ></v-textarea>
                                <div v-else class="comments-display pa-4 mt-4">
                                    <div class="text-caption font-weight-bold mb-2">Comentarios</div>
                                    <div class="text-body-2">{{ enroll.comments }}</div>
                                </div>
                            </v-col> 
                        </v-row>
                    </v-card-text>
                    
                    <v-card-actions class="pa-6 pt-0">
                        <v-spacer></v-spacer>
                        <v-btn 
                            variant="tonal" 
                            @click="isActive.value = false" 
                            rounded="lg"
                            class="mr-2"
                        >
                            {{ hasSubmitted ? 'Cerrar' : 'Cancelar' }}
                        </v-btn>
                        <v-btn 
                            v-if="!hasSubmitted" 
                            :disabled="!valid" 
                            color="primary" 
                            variant="flat" 
                            @click="submitEnroll" 
                            rounded="lg"
                            class="submit-btn"
                        >
                            <Icon icon="mdi:send" height="18" class="mr-2" />
                            Enviar Solicitud
                        </v-btn> 
                        <v-btn 
                            v-if="hasSubmitted" 
                            color="error" 
                            variant="flat" 
                            @click="" 
                            rounded="lg"
                            class="delete-btn"
                        >
                            <Icon icon="mdi:delete-outline" height="18" class="mr-2" />
                            Eliminar Solicitud
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>

<style scoped>
.enroll-btn {
    font-weight: 600;
    text-transform: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
}

.enroll-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.enroll-dialog {
    overflow: hidden;
}

.enroll-header {
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%) !important;
}

.header-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.info-alert-modern {
    border-left: 4px solid rgb(33, 150, 243);
}

.applicant-name-section {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-radius: 10px;
    border-left: 3px solid rgb(99, 102, 241);
    display: flex;
    align-items: center;
}

.info-item {
    background: rgba(99, 102, 241, 0.03);
    border-radius: 8px;
    display: flex;
    align-items: center;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.comments-display {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border-radius: 10px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.submit-btn, .delete-btn {
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
</style>
