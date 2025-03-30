<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const userRole = authStore.userRole;
const userId = authStore.userId;
const router = useRouter();

// Sobrescribir temporalmente el método push de vue-router cuando estamos en vista recomendada
const setupNavigationFix = () => {
  const originalPush = router.push;
  const alternativePush = (path: string | { path: string, query?: Record<string, any> }) => {
    if (filterType.value === 'recommended') {
      console.log('Usando navegación alternativa para evitar errores');
      filterType.value = 'all'; // Resetear el filtro antes de la navegación
      
      // Usar navegación del navegador en lugar de vue-router
      // Esto evita el problema de actualización de DOM durante la transición
      if (typeof path === 'string') {
        setTimeout(() => {
          window.location.href = path;
        }, 10);
        return Promise.resolve();
      } else if (path.path) {
        setTimeout(() => {
          window.location.href = path.path;
        }, 10);
        return Promise.resolve();
      }
    }
    
    // Usar el método original para otros casos
    return originalPush(path);
  };
  
  // Reemplazar el método push con nuestra versión
  router.push = alternativePush as typeof router.push;
};

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
const menuOpen = ref(false); // Para controlar el estado del menú desplegable

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
  console.log('Cargando vacantes recomendadas...');
  try {
    isLoading.value = true;
    const response = await axios.get(`http://localhost:3000/vacancies/recommend-vacants-for-student/${userId}`);
    
    if (response.data && response.data.recommendedVacants) {
      // Transformar los datos para que tengan el mismo formato que las vacantes normales
      const transformed = response.data.recommendedVacants.map((recommendation: any) => {
        const vacant = { ...recommendation.vacant };
        // Añadir propiedades de coincidencia para mostrar en el componente
        vacant.matchPercentage = recommendation.matchPercentage;
        vacant.matchScore = recommendation.matchScore;
        vacant.matchingSkills = recommendation.matchingSkills;
        vacant.recruiter = recommendation.recruiter;
        return vacant;
      });
      
      console.log(`Se encontraron ${transformed.length} vacantes recomendadas`);
      recommendedVacants.value = transformed;
    } else {
      console.log('La respuesta no tiene el formato esperado:', response.data);
      recommendedVacants.value = [];
    }
  } catch (error) {
    console.error('Error al obtener vacantes recomendadas:', error);
    recommendedVacants.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Manejar cambio de filtro
const handleFilterChange = async (newValue: string) => {
  console.log('Filtro cambiado a:', newValue);
  menuOpen.value = false; // Cerrar el menú del select
  
  if (newValue === 'recommended') {
    if (recommendedVacants.value.length === 0) {
      await fetchRecommendedVacants();
    }
  }
};

onMounted(async () => {
  console.log('Componente Vacancies montado');
  await fetchAllVacants();
  
  // Pre-cargar recomendaciones para evitar espera al seleccionar
  if (userRole.toLowerCase() === 'estudiante') {
    await fetchRecommendedVacants();
  }
  
  // Configurar la solución de navegación
  setupNavigationFix();
});

// Cambiar las vacantes a mostrar según el filtro seleccionado
watch(filterType, async (newValue) => {
  await handleFilterChange(newValue);
});

const filteredVacants = computed(() => {
  // Determinar qué conjunto de vacantes usar basado en el filtro
  const vacantsToFilter = filterType.value === 'all' ? vacants.value : recommendedVacants.value;
  
  console.log(`Filtrando vacantes para tipo ${filterType.value}. Total: ${vacantsToFilter?.length || 0}`);
  
  // Si no hay término de búsqueda, devolver todas las vacantes del conjunto seleccionado
  if (!searchQuery.value) {
    return vacantsToFilter || [];
  }
  
  // Filtrar por término de búsqueda dentro del conjunto seleccionado
  const query = searchQuery.value.toLowerCase();
  return (vacantsToFilter || []).filter(vacant => 
    (vacant?.name || '').toLowerCase().includes(query) || 
    (vacant?.company || '').toLowerCase().includes(query)
  );
});

// Utilizar navegación simple sin vue-router para evitar errores
const navigateToPage = (path: string) => {
  if (filterType.value === 'recommended') {
    // Cambiar de nuevo al filtro "all" para evitar problemas
    filterType.value = 'all';
    
    // Usar navegación del navegador en lugar de Vue Router
    setTimeout(() => {
      window.location.href = path;
    }, 10);
  } else {
    // Usar Vue Router normal para navegación cuando no estamos en recomendadas
    router.push(path);
  }
};
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
                @update:model-value="handleFilterChange"
                :menu-props="{ contentClass: 'filter-menu' }"
            ></v-select>
        </v-col>
        
        <v-col v-if="userRole.toLowerCase() === 'reclutador'" 
            :cols="12" 
            :sm="userRole.toLowerCase() === 'estudiante' ? 12 : 6" 
            :md="userRole.toLowerCase() === 'estudiante' ? 4 : 8" 
            class="d-flex justify-end pl-2">
            <!-- Usar nuestra función de navegación personalizada en lugar de 'to' -->
            <v-btn 
                color="primary" 
                flat 
                @click="navigateToPage('/new/job-opportunity')"
            >
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
    
    <!-- Vista de todas las vacantes -->
    <v-row v-if="filterType === 'all'" key="all-vacants">
        <v-col v-for="vacant in filteredVacants" :key="'all-'+vacant.id" cols="12" md="12">
            <VacantContent :vacant="vacant"/>
        </v-col>
    </v-row>
    
    <!-- Vista de vacantes recomendadas -->
    <v-row v-else key="recommended-vacants">
        <v-col v-for="vacant in filteredVacants" :key="'rec-'+vacant.id" cols="12" md="12">
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

.filter-menu {
  z-index: 100;
}
</style>