<script setup lang="ts">
import sendApply from '@/components/vacancies/sendApplication.vue';
import { useAuthStore } from '@/stores/auth';
import { ref, onMounted, computed } from 'vue';
import { Icon } from "@iconify/vue";
import { CircleIcon, MapPinIcon } from 'vue-tabler-icons';

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
    <div class="vacant-card-modern">
        <v-alert 
            v-if="showAlert" 
            :type="alertType"  
            variant="tonal" 
            class="mb-3 alert-modern" 
            dismissible 
            @mouseleave="showAlert = false"
            border="start"
        >
            <template v-slot:prepend>
                <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
            </template>
            <div>{{ snackbarMessage }}</div>
        </v-alert>
        
        <v-card class="vacant-card" elevation="0">
            <!-- Banner de coincidencia para vacantes recomendadas -->
            <div v-if="isRecommended && vacant && vacant.matchPercentage" class="match-banner-modern" :class="`match-${getMatchColor(vacant.matchPercentage)}`">
                <div class="match-banner-content">
                    <v-icon class="match-icon">mdi-check-circle-outline</v-icon>
                    <div class="match-text">
                        <span class="match-label">Coincidencia de habilidades:</span>
                        <span class="match-percentage">{{ vacant.matchPercentage }}%</span>
                    </div>
                    <v-tooltip location="top">
                        <template v-slot:activator="{ props }">
                            <v-icon v-bind="props" class="info-icon">mdi-information-outline</v-icon>
                        </template>
                        Esta vacante coincide con tus habilidades.
                    </v-tooltip>
                </div>
            </div>
            
            <div class="vacant-card-content">
                <!-- Left side - General info -->
                <div class="vacant-info-sidebar">
                    <div class="vacant-header-section">
                        <h2 class="vacant-title">{{ vacant?.name }}</h2>
                        <h3 class="vacant-company">{{ vacant?.company }}</h3>
                        <div class="vacant-recruiter">
                            <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                            <RouterLink 
                                class="recruiter-link" 
                                :to="`/profile/${vacant?.user?.id || vacant?.recruiter?.id}`"
                            >
                                {{ vacant?.user?.name || vacant?.recruiter?.name }} {{ vacant?.user?.lastName || vacant?.recruiter?.lastName }}
                            </RouterLink>
                        </div>
                    </div>
                    
                    <div class="vacant-details-list">
                        <div class="detail-item" v-if="vacant?.location">
                            <div class="detail-icon-wrapper">
                                <v-icon color="primary">mdi-map-marker</v-icon>
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Ubicación</span>
                                <span class="detail-value">{{ vacant?.location }}</span>
                            </div>
                        </div>
                        
                        <div class="detail-item" v-if="vacant?.category">
                            <div class="detail-icon-wrapper">
                                <Icon icon="solar:tag-horizontal-broken" height="20" />
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Categoría</span>
                                <span class="detail-value">{{ vacant?.category }}</span>
                            </div>
                        </div>
                        
                        <div class="detail-item" v-if="vacant?.modality">
                            <div class="detail-icon-wrapper">
                                <Icon icon="solar:screencast-2-line-duotone" height="20" />
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Modalidad</span>
                                <span class="detail-value">{{ vacant?.modality }}</span>
                            </div>
                        </div>
                        
                        <div class="detail-item" v-if="vacant?.level">
                            <div class="detail-icon-wrapper">
                                <Icon icon="solar:user-plus-rounded-line-duotone" height="20" />
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Nivel</span>
                                <span class="detail-value">{{ vacant?.level }}</span>
                            </div>
                        </div>
                        
                        <div class="detail-item salary-item" v-if="vacant?.salary">
                            <div class="detail-icon-wrapper">
                                <Icon icon="solar:dollar-line-duotone" height="20"/>
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Salario</span>
                                <span class="detail-value salary-value">{{ vacant?.salary }} - {{ vacant?.salaryPeriod }}</span>
                            </div>
                        </div>
                        
                        <div class="detail-item status-item">
                            <div class="detail-icon-wrapper">
                                <v-icon color="success">mdi-check-circle</v-icon>
                            </div>
                            <div class="detail-content">
                                <span class="detail-label">Estado</span>
                                <v-chip 
                                    color="success" 
                                    class="status-chip" 
                                    size="small" 
                                    rounded="lg"
                                > 
                                    {{ vacant?.status ? (vacant.status.charAt(0).toUpperCase() + vacant.status.slice(1)) : 'Desconocido' }}
                                </v-chip>
                            </div>
                        </div>
                    </div>
                    
                    <div v-if="userRole && vacant?.status && userRole.toLowerCase() === 'estudiante' && vacant.status.toLowerCase() === 'activo'" class="apply-section">
                        <sendApply :vacant="vacant?.id" @applySaved="applicationSent" @applyDeleted="applicationDeleted"/>
                    </div>
                </div>

                <!-- Right side - Description -->
                <div class="vacant-description-side">
                    <div class="description-header">
                        <h3 class="description-title">Descripción del empleo</h3>
                        <div class="description-meta">
                            <span class="description-date">
                                <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                {{ formatDateTime(vacant?.createdAt) }}
                            </span>
                            <v-btn 
                                v-if="vacant?.user && vacant?.user.id === userId" 
                                :to="`/details/job-opportunity/${vacant?.id}`" 
                                icon 
                                variant="text"
                                size="small"
                                class="details-btn"
                            >
                                <Icon icon="solar:eye-linear" height="20" />
                                <v-tooltip activator="parent" location="bottom">Ver Detalles</v-tooltip>
                            </v-btn>
                        </div>
                    </div>
                    
                    <v-divider class="my-4"></v-divider>
                    
                    <div class="description-content" v-html="vacant?.description"></div>
                    
                    <v-divider class="my-4"></v-divider>
                    
                    <div class="requirements-section">
                        <h4 class="requirements-title">
                            <v-icon class="mr-2" color="primary">mdi-format-list-bulleted</v-icon>
                            Habilidades Requeridas
                        </h4>
                        <div class="requirements-content">
                            {{ vacant?.requirements }}
                        </div>
                    </div>
                    
                    <!-- Mostrar habilidades coincidentes para vacantes recomendadas -->
                    <div v-if="isRecommended && vacant && vacant.matchingSkills" class="matching-skills-section">
                        <v-divider class="my-4"></v-divider>
                        <h4 class="matching-skills-title">
                            <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
                            Tus habilidades coincidentes
                        </h4>
                        <div class="skills-chip-group">
                            <v-chip
                                v-for="skill in vacant.matchingSkills"
                                :key="skill"
                                color="success"
                                variant="tonal"
                                size="small"
                                class="skill-chip"
                            >
                                {{ skill }}
                            </v-chip>
                        </div>
                    </div>
                </div>
            </div>
        </v-card>
    </div>
</template>

<style lang="scss">
.vacant-card-modern {
    width: 100%;
    animation: fadeInUp 0.5s ease;
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

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.vacant-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.vacant-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
}

.match-banner-modern {
    padding: 12px 20px;
    border-bottom: 2px solid;
    animation: slideDown 0.3s ease;
}

.match-banner-modern.match-success {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
    border-bottom-color: rgba(76, 175, 80, 0.3);
}

.match-banner-modern.match-info {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
    border-bottom-color: rgba(33, 150, 243, 0.3);
}

.match-banner-modern.match-warning {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
    border-bottom-color: rgba(255, 152, 0, 0.3);
}

.match-banner-modern.match-error {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
    border-bottom-color: rgba(244, 67, 54, 0.3);
}

.match-banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.match-icon {
    font-size: 24px;
}

.match-text {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
}

.match-label {
    font-weight: 500;
    font-size: 0.9rem;
}

.match-percentage {
    font-weight: 700;
    font-size: 1.1rem;
}

.info-icon {
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.info-icon:hover {
    opacity: 1;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.vacant-card-content {
    display: flex;
    position: relative;
    overflow: hidden;
}

.vacant-info-sidebar {
    width: 320px;
    min-width: 320px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border-right: 1px solid rgba(99, 102, 241, 0.1);
    flex-shrink: 0;
}

.vacant-header-section {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.vacant-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 6px;
    line-height: 1.3;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.vacant-company {
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 10px;
}

.vacant-recruiter {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #64748b;
}

.recruiter-link {
    color: rgb(99, 102, 241);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
}

.recruiter-link:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.vacant-details-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    background: white;
    border-radius: 8px;
    border-left: 3px solid rgb(99, 102, 241);
    transition: all 0.2s ease;
}

.detail-item:hover {
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
    transform: translateX(4px);
}

.detail-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    flex-shrink: 0;
}

.detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.detail-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.detail-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.3;
}

.salary-item {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%);
    border-left-color: rgb(76, 175, 80);
}

.salary-value {
    color: rgb(76, 175, 80);
    font-weight: 700;
}

.status-item {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.02) 100%);
}

.status-chip {
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.apply-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 2px solid rgba(99, 102, 241, 0.1);
}

.vacant-description-side {
    flex: 1;
    padding: 20px;
    background: white;
}

.description-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.description-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.description-meta {
    display: flex;
    align-items: center;
    gap: 12px;
}

.description-date {
    font-size: 0.85rem;
    color: #64748b;
    display: flex;
    align-items: center;
}

.details-btn {
    transition: all 0.2s ease;
}

.details-btn:hover {
    transform: scale(1.1);
    color: rgb(99, 102, 241) !important;
}

.description-content {
    color: #475569;
    line-height: 1.7;
    font-size: 0.9rem;
}

.requirements-section {
    margin-top: 20px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 10px;
    border-left: 3px solid rgb(99, 102, 241);
}

.requirements-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.requirements-content {
    color: #475569;
    line-height: 1.5;
    font-size: 0.9rem;
}

.matching-skills-section {
    margin-top: 20px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%);
    border-radius: 10px;
    border-left: 3px solid rgb(76, 175, 80);
}

.matching-skills-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
}

.skills-chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-chip {
    font-weight: 600;
    transition: all 0.2s ease;
}

.skill-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(76, 175, 80, 0.2);
}

@media (max-width: 960px) {
    .vacant-card-content {
        flex-direction: column;
    }
    
    .vacant-info-sidebar {
        width: 100%;
        min-width: 100%;
        border-right: none;
        border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    }
    
    .description-header {
        flex-direction: column;
        gap: 12px;
    }
}
</style>
