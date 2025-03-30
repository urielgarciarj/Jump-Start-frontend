<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ProjectContent from '@/components/projects/ProjectContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

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
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row class="d-flex align-center mb-4" no-gutters>
        <v-col cols="12" sm="6" md="4" class="d-flex justify-start pr-2">
            <v-text-field
                v-model="searchQuery"
                variant="outlined"
                prepend-inner-icon="mdi-magnify"
                placeholder="Búscar"
                hide-details
                density="compact"
                color="primary"
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
            ></v-select>
        </v-col>
    </v-row>
    
    <!-- Indicador de carga -->
    <v-overlay v-if="isLoading" :value="isLoading" class="align-center justify-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    
    <!-- Mensaje cuando no hay proyectos recomendados -->
    <v-alert
        v-if="filterType === 'recommended' && recommendedProjects.length === 0 && !isLoading"
        type="info"
        variant="tonal"
        class="mb-4"
    >
        No hay proyectos recomendados disponibles. Añade más habilidades a tu perfil para obtener recomendaciones.
    </v-alert>
    
    <!-- Información de coincidencia para proyectos recomendados -->
    <v-alert
        v-if="filterType === 'recommended' && recommendedProjects.length > 0"
        type="success"
        variant="tonal"
        class="mb-4"
    >
        Estos proyectos han sido recomendados basados en tus habilidades.
    </v-alert>
    
    <v-row>
        <template v-for="project in filteredProjects" :key="project.id">
            <ProjectContent :project="project"/>
        </template>
    </v-row>
</template>