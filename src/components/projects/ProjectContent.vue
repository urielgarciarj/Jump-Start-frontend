<script setup lang="ts">
import sendApply from '@/components/vacancies/sendApplication.vue';
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted, computed } from 'vue';
import { Icon } from "@iconify/vue";

const authStore = useAuthStore();
const userId = authStore.userId;
const userRole = authStore.userRole;

const props = defineProps({
    vacant: Object
});

const showAlert = ref(false); // Controlar la visibilidad del snackbar
const alertType = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarMessage = ref(''); // Mensaje para mostrar en el snackbar
const applicationSent = (success: boolean) => {
    if (success) {
        snackbarMessage.value = '¡Tu solicitud fue enviada con éxito!';
        alertType.value = 'success';
    } else {
        snackbarMessage.value = 'Hubo un error al enviar la solicitud. Intenta nuevamente.';
        alertType.value = 'error';
    }
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 5000);
};
const applicationDeleted = (success: boolean) => {
    if (success) {
        snackbarMessage.value = '¡Tu solicitud fue eliminada!';
        alertType.value = 'success';
    } else {
        snackbarMessage.value = 'Hubo un error al eliminar la solicitud. Intenta nuevamente.';
        alertType.value = 'error';
    }
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 5000);
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
</script>

<template>
    <v-alert v-if="showAlert" :type="alertType"  variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert>
     <v-card variant="outlined">
        <div class="d-flex mainbox">
            <!---left side for genral info -->
            <div class="left-part">
                <v-card-item>
                    <h2 >{{ vacant?.name }}</h2>
                    <h3 >{{ vacant?.company }}</h3>
                    <span class="text-subtitle-2 opacity-50">
                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                        {{ vacant?.user.name }} {{ vacant?.user.lastName }}
                    </span>
                    <br /><br />
                    <div class="d-flex gap-3 mb-5" v-if="vacant?.location">
                        <MapPinIcon size="21" />
                        <span class="text-h6">{{ vacant?.location }}</span>
                        <v-tooltip activator="parent" location="start"> Ubicación </v-tooltip>
                    </div>
                    <div class="d-flex gap-3 mb-5" v-if="vacant?.category">
                        <Icon icon="solar:tag-horizontal-broken" height="20" />
                        <span class="text-h6">{{ vacant?.category }}</span>
                        <v-tooltip activator="parent" location="start"> Categoría </v-tooltip>
                    </div>
                    <div class="d-flex gap-3 mb-5" v-if="vacant?.modality">
                        <Icon icon="solar:screencast-2-line-duotone" height="20" />
                        <span class="text-h6"> {{ vacant?.modality }}</span>
                        <v-tooltip activator="parent" location="start"> Modalidad </v-tooltip>
                    </div>
                    <div class="d-flex gap-3 mb-5" v-if="vacant?.level">
                        <Icon icon="solar:user-plus-rounded-line-duotone" height="20" />
                        <span class="text-h6">{{ vacant?.level }}</span>
                        <v-tooltip activator="parent" location="start"> Nivel </v-tooltip>
                    </div>
                    <div class="d-flex gap-3 mb-5" v-if="vacant?.salary">
                        <Icon icon="solar:dollar-line-duotone" height="20"/>
                        <span class="text-h6">{{ vacant?.salary }} - {{ vacant?.salaryPeriod }}</span>
                        <v-tooltip activator="parent" location="start"> Sueldo </v-tooltip>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <span class="text-h6">Estado:</span>
                        <v-chip color="success" class="font-weight-bold d-flex justify-end" size="small" rounded="sm"> 
                            {{ vacant?.status.charAt(0).toUpperCase() + vacant?.status.slice(1) }}
                        </v-chip>
                    </div>
                    <div v-if="userRole.toLowerCase() === 'estudiante' && vacant?.status.toLowerCase() === 'activo'">
                        <v-col color="secondary" class="font-weight-bold d-flex" sm="6" rounded="sm"> 
                            <sendApply :vacant="vacant?.id" @applySaved="applicationSent" @applyDeleted="applicationDeleted"/>
                        </v-col>
                    </div>
                </v-card-item>
            </div>

            <!---right side for description -->
            <div class="right-part">
                <v-card-item>
                    <v-card-text>
                        <div class="d-block d-sm-flex gap-3">
                            <h3>Descripción completa del empleo</h3>
                            <span class="text-subtitle-2 opacity-50">
                                <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                {{ formatDateTime(vacant?.createdAt) }}
                            </span>
                            <v-btn v-if="vacant?.user.id === userId" :to="`/details/job-opportunity/${vacant?.id}`" icon flat size="32">
                                <Icon icon="solar:eye-linear" class="text-primary" height="18" />
                                <v-tooltip activator="parent" location="bottom">Ver Detalles</v-tooltip>
                            </v-btn>
                        </div>
                        <v-divider></v-divider>
                        <div v-html="vacant?.description"></div>
                    </v-card-text>
                </v-card-item>
            </div>
        </div>
     </v-card>
</template>

