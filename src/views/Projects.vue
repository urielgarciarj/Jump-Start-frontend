<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ProjectContent from '@/components/projects/ProjectContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

const authStore = useAuthStore();
const userRole = authStore.userRole;
const userId = authStore.userId;

const page = ref({ title: 'Proyectos Académicos' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Proyectos', disabled: true, href: '#' }
]);

const projects = ref<any[]>([]);
const recommendedProjects = ref<any[]>([]);
const searchQuery = ref('');
const filterType = ref('all'); // 'all' o 'recommended'
const isLoading = ref(false);

// Opciones para el select de filtrado
const filterOptions = [
  { title: 'Todos los proyectos', value: 'all' },
  { title: 'Proyectos recomendados para mi', value: 'recommended' }
];

// Cargar todos los proyectos
const fetchAllProjects = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get('http://localhost:3000/projects/list');
    projects.value = response.data;
  } catch (error) {
    console.error('Error al obtener el listado de proyectos:', error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar proyectos recomendados
const fetchRecommendedProjects = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`http://localhost:3000/projects/recommendations/${userId}`);
    recommendedProjects.value = response.data.recommendations;
  } catch (error) {
    console.error('Error al obtener proyectos recomendados:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchAllProjects();
  // Pre-cargar recomendaciones para evitar espera al seleccionar
  await fetchRecommendedProjects();
});

// Cambiar los proyectos a mostrar según el filtro seleccionado
watch(filterType, async (newValue) => {
  if (newValue === 'recommended' && recommendedProjects.value.length === 0) {
    // Solo cargar recomendaciones si aún no se han cargado
    await fetchRecommendedProjects();
  }
});

const filteredProjects = computed(() => {
  // Determinar qué conjunto de proyectos usar basado en el filtro
  const projectsToFilter = filterType.value === 'all' ? projects.value : recommendedProjects.value;
  
  // Si no hay término de búsqueda, devolver todos los proyectos del conjunto seleccionado
  if (!searchQuery.value) {
    return projectsToFilter;
  }
  
  // Filtrar por término de búsqueda dentro del conjunto seleccionado
  const query = searchQuery.value.toLowerCase();
  return projectsToFilter.filter(project => 
    project.name.toLowerCase().includes(query) || 
    project.category.toLowerCase().includes(query)
  );
});
</script>

<template>
    <div class="projects-page-container">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        
        <div class="projects-filters mb-6">
            <v-row class="d-flex align-center" no-gutters>
                <v-col cols="12" sm="6" md="4" class="d-flex justify-start pr-2">
                    <v-text-field
                        v-model="searchQuery"
                        variant="outlined"
                        prepend-inner-icon="mdi-magnify"
                        placeholder="Buscar proyectos..."
                        hide-details
                        density="compact"
                        color="primary"
                        rounded="lg"
                        class="search-field"
                    ></v-text-field>
                </v-col>
                <v-col v-if="userRole.toLowerCase() === 'estudiante'" cols="12" sm="6" md="4" class="d-flex justify-start pl-2">
                    <v-select
                        v-model="filterType"
                        :items="filterOptions"
                        item-title="title"
                        item-value="value"
                        variant="outlined"
                        hide-details
                        density="compact"
                        color="primary"
                        label="Tipo de proyectos"
                        rounded="lg"
                        class="filter-select"
                    ></v-select>
                </v-col>
            </v-row>
        </div>
        
        <!-- Indicador de carga -->
        <v-overlay v-if="isLoading" :value="isLoading" class="align-center justify-center">
            <div class="loading-container">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-body-1">Cargando proyectos...</p>
            </div>
        </v-overlay>
        
        <!-- Mensaje cuando no hay proyectos recomendados -->
        <v-alert
            v-if="filterType === 'recommended' && recommendedProjects.length === 0 && !isLoading"
            type="info"
            variant="tonal"
            class="mb-4 info-alert"
            rounded="lg"
        >
            <template v-slot:prepend>
                <Icon icon="mdi:information-outline" height="24" />
            </template>
            <div class="font-weight-medium">No hay proyectos recomendados disponibles</div>
            <div class="text-caption mt-1">Añade más habilidades a tu perfil para obtener recomendaciones personalizadas.</div>
        </v-alert>
        
        <!-- Información de coincidencia para proyectos recomendados -->
        <v-alert
            v-if="filterType === 'recommended' && recommendedProjects.length > 0"
            type="success"
            variant="tonal"
            class="mb-4 success-alert"
            rounded="lg"
        >
            <template v-slot:prepend>
                <Icon icon="mdi:check-circle-outline" height="24" />
            </template>
            <div class="font-weight-medium">Proyectos recomendados para ti</div>
            <div class="text-caption mt-1">Estos proyectos han sido seleccionados basados en tus habilidades y perfil.</div>
        </v-alert>
        
        <!-- Mensaje cuando no hay proyectos -->
        <v-card
            v-if="filteredProjects.length === 0 && !isLoading"
            class="empty-projects-card pa-8 text-center mb-4"
            variant="outlined"
            rounded="lg"
        >
            <div class="empty-projects-icon mb-4">
                <Icon icon="mdi:folder-outline" height="64" color="primary" class="opacity-50" />
            </div>
            <h3 class="text-h5 mb-3 font-weight-bold">No se encontraron proyectos</h3>
            <p class="text-body-1 text-medium-emphasis">
                {{ filterType === 'recommended' ? 'No hay proyectos que coincidan con tus habilidades en este momento.' : 'Intenta ajustar tus filtros de búsqueda.' }}
            </p>
        </v-card>
        
        <v-row v-else>
            <template v-for="project in filteredProjects" :key="project.id">
                <ProjectContent :project="project"/>
            </template>
        </v-row>
    </div>
</template>

<style scoped>
.projects-page-container {
    padding-bottom: 2rem;
}

.projects-filters {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    padding: 20px;
    border-radius: 16px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.search-field {
    transition: all 0.3s ease;
}

.search-field:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.filter-select {
    transition: all 0.3s ease;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.info-alert {
    border-left: 4px solid rgb(33, 150, 243);
    animation: slideIn 0.3s ease;
}

.success-alert {
    border-left: 4px solid rgb(76, 175, 80);
    animation: slideIn 0.3s ease;
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

.empty-projects-card {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border: 2px dashed rgba(99, 102, 241, 0.2);
    transition: all 0.3s ease;
}

.empty-projects-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
}

.empty-projects-icon {
    animation: float 3s ease-in-out infinite;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}
</style>