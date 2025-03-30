<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userRole = authStore.userRole;
const userId = authStore.userId;

const page = ref({ title: 'Ofertas Laborales' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Vacantes', disabled: true, href: '#' }
]);

const vacants = ref<any[]>([]);
const recommendedVacants = ref<any[]>([]);
const searchQuery = ref('');
const filterType = ref('all'); // 'all' o 'recommended'
const isLoading = ref(false);

// Opciones para el select de filtrado
const filterOptions = [
  { title: 'Todas las vacantes', value: 'all' },
  { title: 'Vacantes recomendadas para mi', value: 'recommended' }
];

// Cargar todas las vacantes
const fetchAllVacants = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get('http://localhost:3000/vacancies/sorted/active');
    vacants.value = response.data;
  } catch (error) {
    console.error('Error al obtener el listado de vacantes:', error);
  } finally {
    isLoading.value = false;
  }
};

// Cargar vacantes recomendadas para el estudiante
const fetchRecommendedVacants = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`http://localhost:3000/vacancies/recommend-vacants-for-student/${userId}`);
    
    // Transformar los datos para que tengan el mismo formato que las vacantes normales
    recommendedVacants.value = response.data.recommendedVacants.map((recommendation: any) => {
      const vacant = { ...recommendation.vacant };
      // Añadir propiedades de coincidencia para mostrar en el componente
      vacant.matchPercentage = recommendation.matchPercentage;
      vacant.matchScore = recommendation.matchScore;
      vacant.matchingSkills = recommendation.matchingSkills;
      vacant.recruiter = recommendation.recruiter;
      return vacant;
    });
  } catch (error) {
    console.error('Error al obtener vacantes recomendadas:', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchAllVacants();
  
  // Pre-cargar recomendaciones si el usuario es estudiante
  if (userRole.toLowerCase() === 'estudiante') {
    await fetchRecommendedVacants();
  }
});

// Cambiar las vacantes a mostrar según el filtro seleccionado
watch(filterType, async (newValue) => {
  if (newValue === 'recommended' && recommendedVacants.value.length === 0) {
    // Solo cargar recomendaciones si aún no se han cargado
    await fetchRecommendedVacants();
  }
});

const filteredVacants = computed(() => {
  // Determinar qué conjunto de vacantes usar basado en el filtro
  const vacantsToFilter = filterType.value === 'all' ? vacants.value : recommendedVacants.value;
  
  // Si no hay término de búsqueda, devolver todas las vacantes del conjunto seleccionado
  if (!searchQuery.value) {
    return vacantsToFilter;
  }
  
  // Filtrar por término de búsqueda dentro del conjunto seleccionado
  const query = searchQuery.value.toLowerCase();
  return vacantsToFilter.filter(vacant => 
    vacant.name.toLowerCase().includes(query) || 
    vacant.company.toLowerCase().includes(query)
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
        
        <!-- Select para filtrar entre todas las vacantes y las recomendadas (solo para estudiantes) -->
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
                label="Tipo de vacantes"
            ></v-select>
        </v-col>
        
        <v-col v-if="userRole.toLowerCase() === 'reclutador'" 
            :cols="12" 
            :sm="userRole.toLowerCase() === 'estudiante' ? 12 : 6" 
            :md="userRole.toLowerCase() === 'estudiante' ? 4 : 8" 
            class="d-flex justify-end pl-2">
            <v-btn color="primary" flat to="/new/job-opportunity">
                Nueva Oferta Laboral
            </v-btn>
        </v-col>
    </v-row>
    
    <!-- Indicador de carga -->
    <v-overlay v-if="isLoading" :value="isLoading" class="align-center justify-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>
    
    <!-- Mensaje cuando no hay vacantes recomendadas -->
    <v-alert
        v-if="filterType === 'recommended' && recommendedVacants.length === 0 && !isLoading"
        type="info"
        variant="tonal"
        class="mb-4"
    >
        No hay vacantes recomendadas disponibles. Añade más habilidades a tu perfil para obtener recomendaciones.
    </v-alert>
    
    <!-- Información de coincidencia para vacantes recomendadas -->
    <v-alert
        v-if="filterType === 'recommended' && recommendedVacants.length > 0"
        type="success"
        variant="tonal"
        class="mb-4"
    >
        Estas vacantes han sido recomendadas basadas en tus habilidades.
    </v-alert>
    
    <v-row>
        <v-col v-for="vacant in filteredVacants" :key="vacant.id" cols="12" md="12">
            <VacantContent :vacant="vacant"/>
        </v-col>
    </v-row>
</template>

<style scoped lang="scss">
@media (max-width: 1279px) {
    .v-card {
        position: unset;
    }
}
</style>