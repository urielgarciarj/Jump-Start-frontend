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

// Verificar si la vacante es recomendada (tiene propiedades de coincidencia)
const isRecommended = computed(() => {
    return props.vacant && props.vacant.matchPercentage !== undefined;
});

// Función para obtener color basado en el porcentaje de coincidencia
const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'info';
    if (percentage >= 50) return 'warning';
    return 'error';
};

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

// Agregar verificación de status para evitar undefined
const hasValidStatus = computed(() => {
  return props.vacant && props.vacant.status !== undefined;
});
</script>

<template>
    <v-alert v-if="showAlert" :type="alertType"  variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert>
    <v-card variant="outlined">
        <!-- Banner de coincidencia para vacantes recomendadas -->
        <v-banner v-if="isRecommended && vacant && vacant.matchPercentage" 
           :color="getMatchColor(vacant.matchPercentage)" 
           class="match-banner"
           density="compact"
        >
            <template v-slot:prepend>
                <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2"></v-icon>
            </template>
            <div class="d-flex justify-space-between align-center w-100">
                <span>Coincidencia de habilidades: <strong>{{ vacant.matchPercentage }}%</strong></span>
                <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                        <v-icon v-bind="props" icon="mdi-information-outline"></v-icon>
                    </template>
                    Esta vacante coincide con tus habilidades.
                </v-tooltip>
            </div>
        </v-banner>
        
        <div class="d-flex mainbox">
            <!---left side for genral info -->
            <div class="left-part">
                <v-card-item>
                    <h2 >{{ vacant?.name }}</h2>
                    <h3 >{{ vacant?.company }}</h3>
                    <span class="text-subtitle-2 opacity-50">
                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                        {{ vacant?.user?.name || vacant?.recruiter?.name }} {{ vacant?.user?.lastName || vacant?.recruiter?.lastName }}
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
                            {{ vacant?.status ? (vacant.status.charAt(0).toUpperCase() + vacant.status.slice(1)) : 'Desconocido' }}
                        </v-chip>
                    </div>
                    <div v-if="userRole && vacant?.status && userRole.toLowerCase() === 'estudiante' && vacant.status.toLowerCase() === 'activo'">
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
                            <h3>Descripción del empleo</h3>
                            <span class="text-subtitle-2 opacity-50">
                                <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                {{ formatDateTime(vacant?.createdAt) }}
                            </span>
                            <v-btn v-if="vacant?.user && vacant?.user.id === userId" :to="`/details/job-opportunity/${vacant?.id}`" icon flat size="32">
                                <Icon icon="solar:eye-linear" class="text-primary" height="18" />
                                <v-tooltip activator="parent" location="bottom">Ver Detalles</v-tooltip>
                            </v-btn>
                        </div>
                        <v-divider></v-divider>
                        <div v-html="vacant?.description"></div>
                        <br />
                        <v-divider></v-divider>
                        
                        <!-- Habilidades requeridas -->
                        <div class="d-block gap-3">
                            <h4>Habilidades Requeridas</h4>
                            <span class="text-body-1">
                                {{ vacant?.requirements }}
                            </span>
                        </div>
                        
                        <!-- Mostrar habilidades coincidentes para vacantes recomendadas -->
                        <div v-if="isRecommended && vacant && vacant.matchingSkills" class="mt-4">
                            <v-divider></v-divider>
                            <h4 class="mt-3">Tus habilidades coincidentes</h4>
                            <v-chip-group class="mt-2">
                                <v-chip
                                    v-for="skill in vacant.matchingSkills"
                                    :key="skill"
                                    color="success"
                                    variant="tonal"
                                    size="small"
                                    class="ma-1"
                                >
                                    {{ skill }}
                                </v-chip>
                            </v-chip-group>
                        </div>
                    </v-card-text>
                </v-card-item>
            </div>
        </div>
     </v-card>
</template>

<style lang="scss">
.mainbox {
    position: relative;
    overflow: hidden;
}
.left-part {
    width: 320px;
    border-right: 1px solid rgb(var(--v-theme-borderColor));
    transition: 0.1s ease-in;
    flex-shrink: 0;
}
.v-theme--light {
    .left-part {
        background: white;
    }
}
.v-theme--dark {
    .left-part {
        background: #2b2b2b;
    }
}
.right-part {
    width: 100%;
    position: relative;
}

.match-banner {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
