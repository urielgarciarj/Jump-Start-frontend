<script setup lang="ts">
import sendApply from '@/components/vacancies/sendApplication.vue';
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted, computed } from 'vue';
import { Icon } from "@iconify/vue";
import UserImage from '@/assets/images/profile/user-5.jpg';

const authStore = useAuthStore();
const userId = authStore.userId;
const userRole = authStore.userRole;

const props = defineProps({
    project: Object
});

const statusColors = {
  "pendiente": "info",
  "progreso": "primary",
  "terminado": "success",
  "cancelado": "error"
};

const categoryColors = {
  "Proyectos de Investigación": "#4B9CD3", // Azul medio
  "Proyectos de Creación": "#7F6AA2", // Lavanda oscuro
  "Proyectos de Innovación": "#67A96D", // Verde oliva
  "Proyectos de Comunicación": "#F2A6A1", // Rosa coral
  "Proyectos de Servicio a la Comunidad": "#F4D35E", // Amarillo mostaza
  "Proyectos de Emprendimiento": "#E6738A", // Rosa oscuro
  "Proyectos de Expresión Artística": "#6BB9F0", // Azul cielo
  "Proyectos de Tecnología y Programación": "#4DC6B0", // Verde menta
  "Proyectos de Sostenibilidad y Medio Ambiente": "#5D9A61", // Verde bosque
  "Proyectos de Educación y Mentoría": "#F2D38E", // Amarillo claro
  "Proyectos de Competencias y Desafíos": "#F1A19B", // Rosa cálido
  "Proyectos de Salud y Bienestar": "#8CB6B9", // Azul grisáceo
  "Proyectos de Historia y Cultura": "#D1A8D5", // Lavanda medio
  "Proyectos de Ingeniería y Construcción": "#D68A3C", // Naranja quemado
  "Proyectos Recreativos": "#FFB154" // Naranja suave
};

const showAlert = ref(false); // Controlar la visibilidad del snackbar
const alertType = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarMessage = ref(''); // Mensaje para mostrar en el snackbar

// const applicationSent = (success: boolean) => {
//     if (success) {
//         snackbarMessage.value = '¡Tu solicitud fue enviada con éxito!';
//         alertType.value = 'success';
//     } else {
//         snackbarMessage.value = 'Hubo un error al enviar la solicitud. Intenta nuevamente.';
//         alertType.value = 'error';
//     }
//     showAlert.value = true;
//     setTimeout(() => { showAlert.value = false; }, 5000);
// };
// const applicationDeleted = (success: boolean) => {
//     if (success) {
//         snackbarMessage.value = '¡Tu solicitud fue eliminada!';
//         alertType.value = 'success';
//     } else {
//         snackbarMessage.value = 'Hubo un error al eliminar la solicitud. Intenta nuevamente.';
//         alertType.value = 'error';
//     }
//     showAlert.value = true;
//     setTimeout(() => { showAlert.value = false; }, 5000);
// };

const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || '';  
};

const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || '';  
};

const formatDateTime = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    weekday: 'long',   // Día de la semana (opcional)
    day: 'numeric',    // Día
    month: 'long',     // Mes
    year: 'numeric',   // Año
    hour: '2-digit',   // Hora (en formato 2 dígitos)
    minute: '2-digit', // Minutos (en formato 2 dígitos)
  });
};

const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleString('es-ES', {
        day: 'numeric',    // Día
        month: 'numeric',     // Mes
        year: 'numeric',   // Año
    });
};
</script>

<template>
    <v-alert v-if="showAlert" :type="alertType"  variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert>
    <v-col cols="12" md="4" sm="4">
        <v-card elevation="10"  rounded="md" class="card-hover">
            <div>
                <div >
                    <v-chip :color="getCategoryColor(project?.category)" class="font-weight-bold d-flex justify-end" size="small" rounded="sm"> 
                        {{ project?.category }}
                    </v-chip>
                </div>
                <div class="d-flex align-center">
                    <v-avatar size="40" color="secondary" class="mx-6">
                        <img :src="project?.professor.profile.picture || UserImage" alt="icon" height="40" />
                    </v-avatar>
                    <div>
                        <span class="text-subtitle ml-2">{{ project?.professor.name }} {{ project?.professor.lastName }}</span>
                        <br />
                        <span class="text-subtitle-2 ml-2 textSecondary">{{ project?.professor.profile.university }}</span>
                    </div>
                </div>
                <v-card-item class="px-6 pt-4">
                    <h5 class="text-h5 text-13 my-4 custom-text-primary">
                        <RouterLink class="text-decoration-none color-inherits custom-title" :to="`/project/details/${project?.id}`" >{{ project?.name }}</RouterLink>
                    </h5>
                    <h5 class="d-flex justify-end">Inicio: {{ formatDate(project?.startDate) }} </h5>
                    <h5 class="d-flex justify-end">Fin: {{ project?.endDate ? formatDate(project?.endDate) : 'Indefinido' }} </h5>
                    <v-expansion-panels variant="inset">
                        <v-expansion-panel elevation="10">
                            <v-expansion-panel-title class="text-h6">Descripción</v-expansion-panel-title>
                            <v-expansion-panel-text>{{ project?.description }}</v-expansion-panel-text>
                            <v-divider></v-divider>
                        </v-expansion-panel>       
                        <v-expansion-panel elevation="10">
                            <v-expansion-panel-title class="text-h6">Requerimientos</v-expansion-panel-title>
                            <v-expansion-panel-text>{{ project?.requirements }}</v-expansion-panel-text>
                            <v-divider></v-divider>
                        </v-expansion-panel>
                    </v-expansion-panels>
                    <div class="d-flex align-center justify-space-between">
                        <div>
                             <v-chip class="font-weight-bold d-flex bg-light" :color="getStatusColor(project?.status)" size="small" rounded="sm" v-text="project?.status"></v-chip>
                        </div>
                        <div>
                            <v-avatar size="10">
                                <CircleIcon size="10" class="text-textPrimary" />
                            </v-avatar>
                            <span class="text-subtitle-2 ml-2 textSecondary" v-text="formatDateTime(project?.dateCreated)"></span>
                        </div>
                    </div>
                </v-card-item>
            </div>
        </v-card>
    </v-col>
</template>

