<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { CircleIcon } from 'vue-tabler-icons';
import { Icon } from '@iconify/vue';
import UserImage from '@/assets/images/profile/user-5.jpg';

const props = defineProps({
    project: Object
});

const statusColors = {
  "abierto": "info",
  "progreso": "primary",
  "completado": "success",
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

const capitalizeFirstLetter = (str: string) => {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Determinar el status del proyecto basado en las fechas
const getProjectStatus = computed(() => {
    if (!props.project) return 'abierto';
    
    // Si el proyecto ya tiene un status definido, usarlo
    if (props.project.status) return props.project.status;
    
    return 'abierto'; // Default
});

// Determinar la fecha a mostrar, usando dateCreated, startDate o una alternativa
const getDisplayDate = computed(() => {
    if (!props.project) return '';
    
    // Primero intentar usar dateCreated si existe
    if (props.project.dateCreated) {
        return formatDateTime(props.project.dateCreated);
    }
    
    // Si no hay dateCreated, usar startDate 
    if (props.project.startDate) {
        return `Fecha de inicio: ${formatDate(props.project.startDate)}`;
    }
    
    // Última opción, devolver fecha actual
    return `Agregado recientemente`;
});
</script>

<template>
    <v-alert 
        v-if="showAlert" 
        :type="alertType"  
        variant="tonal" 
        class="mb-3 alert-modern" 
        dismissible 
        @mouseleave="showAlert = false"
        rounded="lg"
    >
        <template v-slot:prepend>
            <Icon icon="mdi:check-circle-outline" height="24" />
        </template>
        <div class="font-weight-medium">{{ snackbarMessage }}</div>
    </v-alert>
    
    <v-col cols="12" md="4" sm="4">
        <v-card variant="outlined" rounded="lg" class="project-card">
            <div class="project-header">
                <v-chip 
                    :style="{ backgroundColor: getCategoryColor(project?.category) }"
                    class="category-chip font-weight-bold" 
                    size="small" 
                    rounded="lg"
                > 
                    {{ project?.category }}
                </v-chip>
            </div>
            
            <v-card-item class="pa-6">
                <div class="professor-section mb-4">
                    <div class="d-flex align-center">
                        <v-avatar size="48" class="professor-avatar">
                            <img :src="project?.professor.profile?.picture || UserImage" alt="icon" height="48" />
                        </v-avatar>
                        <div class="ml-3">
                            <RouterLink 
                                class="professor-name text-decoration-none" 
                                :to="`/profile/${project?.professor.id}`"
                            >
                                {{ project?.professor.name }} {{ project?.professor.lastName }}
                            </RouterLink>
                            <div class="text-caption text-medium-emphasis mt-1">
                                <Icon icon="mdi:school-outline" height="14" class="mr-1" />
                                {{ project?.professor.profile?.university }}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="project-title-section mb-4">
                    <RouterLink 
                        class="project-title text-decoration-none" 
                        :to="`/project/details/${project?.id}`"
                    >
                        {{ project?.name }}
                    </RouterLink>
                </div>
                
                <div class="project-dates mb-4">
                    <div class="date-item mb-2">
                        <Icon icon="mdi:calendar-start" height="16" class="mr-2 date-icon" />
                        <span class="text-body-2"><strong>Inicio:</strong> {{ formatDate(project?.startDate) }}</span>
                    </div>
                    <div class="date-item">
                        <Icon icon="mdi:calendar-end" height="16" class="mr-2 date-icon" />
                        <span class="text-body-2"><strong>Fin:</strong> {{ project?.endDate ? formatDate(project?.endDate) : 'Indefinido' }}</span>
                    </div>
                </div>
                
                <v-expansion-panels variant="accordion" class="mb-4">
                    <v-expansion-panel rounded="lg" class="expansion-panel-modern">
                        <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                            <Icon icon="mdi:text-box-outline" height="18" class="mr-2" />
                            Descripción
                        </v-expansion-panel-title>
                        <v-expansion-panel-text class="text-body-2">
                            {{ project?.description }}
                        </v-expansion-panel-text>
                    </v-expansion-panel>       
                    <v-expansion-panel rounded="lg" class="expansion-panel-modern">
                        <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                            <Icon icon="mdi:lightbulb-on-outline" height="18" class="mr-2" />
                            Habilidades Requeridas
                        </v-expansion-panel-title>
                        <v-expansion-panel-text class="text-body-2">
                            {{ project?.requirements }}
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                    <!-- Panel para habilidades coincidentes (solo en proyectos recomendados) -->
                    <v-expansion-panel v-if="project?.matchingSkills" rounded="lg" class="expansion-panel-modern matching-panel">
                        <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                            <Icon icon="mdi:check-circle-outline" height="18" class="mr-2" />
                            Habilidades Coincidentes
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <div v-if="project?.exactMatches && project.exactMatches.length > 0" class="mb-3">
                                <div class="text-caption font-weight-bold mb-2 text-success">Coincidencias exactas:</div>
                                <v-chip-group>
                                    <v-chip
                                        v-for="skill in project.exactMatches"
                                        :key="skill"
                                        color="success"
                                        variant="tonal"
                                        size="small"
                                        class="ma-1 skill-chip"
                                    >
                                        {{ skill }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                            <div v-if="project?.partialMatches && project.partialMatches.length > 0">
                                <div class="text-caption font-weight-bold mb-2 text-info">Coincidencias parciales:</div>
                                <v-chip-group>
                                    <v-chip
                                        v-for="skill in project.partialMatches"
                                        :key="skill"
                                        color="info"
                                        variant="tonal"
                                        size="small"
                                        class="ma-1 skill-chip"
                                    >
                                        {{ skill }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
                
                <v-divider class="mb-4"></v-divider>
                
                <div class="d-flex align-center justify-space-between">
                    <v-chip 
                        :color="getStatusColor(getProjectStatus)" 
                        class="font-weight-bold status-chip" 
                        size="small" 
                        rounded="lg"
                    >
                        {{ capitalizeFirstLetter(getProjectStatus) }}
                    </v-chip>
                    <div class="d-flex align-center project-date-info">
                        <CircleIcon size="8" fill="inherit" class="date-dot mr-1" />
                        <span class="text-caption text-medium-emphasis">{{ getDisplayDate }}</span>
                    </div>
                </div>
            </v-card-item>
        </v-card>
    </v-col>
</template>

<style scoped>
.alert-modern {
    border-left: 4px solid;
    animation: slideIn 0.3s ease;
}

.project-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
    height: 100%;
}

.project-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
}

.project-header {
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: flex-end;
}

.category-chip {
    color: white !important;
    font-weight: 600;
    text-transform: capitalize;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
}

.category-chip:hover {
    transform: scale(1.05);
}

.professor-section {
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.professor-avatar {
    border: 3px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.professor-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.professor-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: rgb(99, 102, 241);
    transition: all 0.2s ease;
}

.professor-name:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.project-title-section {
    padding: 12px 0;
}

.project-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.3;
    transition: all 0.2s ease;
}

.project-title:hover {
    color: rgb(99, 102, 241);
}

.project-dates {
    padding: 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 10px;
    border-left: 3px solid rgb(99, 102, 241);
}

.date-item {
    display: flex;
    align-items: center;
}

.date-icon {
    color: rgb(99, 102, 241);
}

.expansion-panel-modern {
    margin-bottom: 8px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.expansion-panel-modern:hover {
    border-color: rgba(99, 102, 241, 0.3);
    background: rgba(99, 102, 241, 0.02);
}

.matching-panel {
    border: 1px solid rgba(76, 175, 80, 0.3);
    background: rgba(76, 175, 80, 0.02);
}

.skill-chip {
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.skill-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.status-chip {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.project-date-info {
    display: flex;
    align-items: center;
}

.date-dot {
    color: rgb(148, 163, 184);
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 600px) {
    .project-card {
        border-radius: 12px !important;
    }
    
    .project-title {
        font-size: 1.1rem;
    }
}
</style>

