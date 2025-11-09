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
    <div class="vacancies-page-modern">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        
        <!-- Header moderno con búsqueda y filtros -->
        <v-card class="vacancies-header-modern mb-6" elevation="0">
            <v-card-item class="pa-6">
                <v-row class="align-center" no-gutters>
                    <v-col cols="12" sm="6" md="4" class="pr-sm-2 mb-sm-0 mb-3">
                        <v-text-field
                            v-model="searchQuery"
                            variant="outlined"
                            prepend-inner-icon="mdi-magnify"
                            placeholder="Buscar ofertas laborales..."
                            hide-details
                            density="comfortable"
                            color="primary"
                            class="search-field-modern"
                        ></v-text-field>
                    </v-col>
                    
                    <!-- Select para filtrar entre todas las vacantes y las recomendadas (solo para estudiantes) -->
                    <v-col v-if="userRole.toLowerCase() === 'estudiante'" cols="12" sm="6" md="4" class="pl-sm-2 pr-md-2 mb-md-0 mb-3">
                        <v-select
                            v-model="filterType"
                            :items="filterOptions"
                            item-title="title"
                            item-value="value"
                            variant="outlined"
                            hide-details
                            density="comfortable"
                            color="primary"
                            label="Tipo de vacantes"
                            prepend-inner-icon="mdi-filter-outline"
                            @update:model-value="handleFilterChange"
                            class="filter-select-modern"
                            :menu-props="{ contentClass: 'filter-menu' }"
                        ></v-select>
                    </v-col>
                    
                    <v-col 
                        v-if="userRole.toLowerCase() === 'reclutador'" 
                        :cols="12" 
                        :sm="userRole.toLowerCase() === 'estudiante' ? 12 : 6" 
                        :md="userRole.toLowerCase() === 'estudiante' ? 4 : 4" 
                        class="d-flex justify-end pl-md-2"
                    >
                        <v-btn 
                            color="primary" 
                            size="large"
                            @click="navigateToPage('/new/job-opportunity')"
                            class="new-vacant-btn-modern"
                        >
                            <v-icon start>mdi-plus-circle</v-icon>
                            Nueva Oferta Laboral
                        </v-btn>
                    </v-col>
                </v-row>
            </v-card-item>
        </v-card>
        
        <!-- Indicador de carga -->
        <v-overlay v-if="isLoading" :value="isLoading" class="align-center justify-center">
            <div class="loading-container">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-h6">Cargando ofertas laborales...</p>
            </div>
        </v-overlay>
        
        <!-- Mensaje cuando no hay vacantes recomendadas -->
        <v-alert
            v-if="filterType === 'recommended' && recommendedVacants.length === 0 && !isLoading"
            type="info"
            variant="tonal"
            class="mb-4 alert-modern"
            border="start"
            border-color="info"
        >
            <template v-slot:prepend>
                <v-icon>mdi-information-outline</v-icon>
            </template>
            <div class="text-h6 mb-2">No hay vacantes recomendadas disponibles</div>
            <div>Añade más habilidades a tu perfil para obtener recomendaciones personalizadas.</div>
        </v-alert>
        
        <!-- Información de coincidencia para vacantes recomendadas -->
        <v-alert
            v-if="filterType === 'recommended' && recommendedVacants.length > 0"
            type="success"
            variant="tonal"
            class="mb-4 alert-modern"
            border="start"
            border-color="success"
        >
            <template v-slot:prepend>
                <v-icon>mdi-check-circle-outline</v-icon>
            </template>
            <div class="text-h6 mb-1">¡Vacantes recomendadas para ti!</div>
            <div>Estas ofertas han sido seleccionadas basadas en tus habilidades y perfil profesional.</div>
        </v-alert>
        
        <!-- Vista de todas las vacantes -->
        <div v-if="filterType === 'all'" key="all-vacants" class="vacancies-grid">
            <div v-for="vacant in filteredVacants" :key="'all-'+vacant.id" class="vacancy-item-wrapper">
                <VacantContent :vacant="vacant"/>
            </div>
            <v-alert
                v-if="filteredVacants.length === 0 && !isLoading"
                type="info"
                variant="tonal"
                class="no-results-alert"
            >
                <template v-slot:prepend>
                    <v-icon>mdi-information-outline</v-icon>
                </template>
                <div class="text-h6 mb-1">No se encontraron ofertas laborales</div>
                <div>Intenta ajustar tus criterios de búsqueda.</div>
            </v-alert>
        </div>
        
        <!-- Vista de vacantes recomendadas -->
        <div v-else key="recommended-vacants" class="vacancies-grid">
            <div v-for="vacant in filteredVacants" :key="'rec-'+vacant.id" class="vacancy-item-wrapper">
                <VacantContent :vacant="vacant"/>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.vacancies-page-modern {
    width: 100%;
    animation: fadeIn 0.6s ease;
}

.vacancies-header-modern {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-radius: 16px;
    border: 1px solid rgba(99, 102, 241, 0.1);
    transition: all 0.3s ease;
}

.vacancies-header-modern:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.search-field-modern :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-field-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.search-field-modern :deep(.v-field--focused) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.filter-select-modern :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-select-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.new-vacant-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.new-vacant-btn-modern:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.new-vacant-btn-modern:active {
    transform: translateY(0);
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgb(99, 102, 241);
}

.alert-modern {
    border-radius: 12px;
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

.vacancies-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.vacancy-item-wrapper {
    animation: fadeInUp 0.5s ease;
    animation-fill-mode: both;
}

.vacancy-item-wrapper:nth-child(1) { animation-delay: 0.1s; }
.vacancy-item-wrapper:nth-child(2) { animation-delay: 0.2s; }
.vacancy-item-wrapper:nth-child(3) { animation-delay: 0.3s; }
.vacancy-item-wrapper:nth-child(4) { animation-delay: 0.4s; }
.vacancy-item-wrapper:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
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

.no-results-alert {
    border-radius: 12px;
    margin-top: 24px;
}

.filter-menu {
    z-index: 100;
}

@media (max-width: 1279px) {
    .v-card {
        position: unset;
    }
}

@media (max-width: 960px) {
    .vacancies-header-modern :deep(.v-card-item) {
        padding: 20px !important;
    }
    
    .new-vacant-btn-modern {
        width: 100%;
    }
}
</style>