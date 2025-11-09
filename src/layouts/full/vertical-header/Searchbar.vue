<script setup>
import { Icon } from '@iconify/vue';
import { ref, watch } from 'vue';
import axios from 'axios';

// Variables reactivas
const searchQuery = ref('');
const searchSugg = ref([]);
const isLoading = ref(false);
const searchTimeout = ref(null);

// Función para hacer la búsqueda con debounce
const performSearch = async (query) => {
  const trimmedQuery = query.trim();
  
  if (!trimmedQuery) {
    searchSugg.value = [];
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  
  try {
    const response = await axios.get(`http://localhost:3000/global-search/search/${trimmedQuery}`);
    searchSugg.value = response.data || [];
  } catch (error) {
    console.error('Error en la búsqueda:', error);
    searchSugg.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Watch para búsqueda en tiempo real con debounce
watch(searchQuery, (newValue) => {
  // Limpiar timeout anterior
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  // Si está vacío, limpiar resultados inmediatamente
  if (!newValue.trim()) {
    searchSugg.value = [];
    isLoading.value = false;
    return;
  }

  // Mostrar loading inmediatamente
  isLoading.value = true;

  // Crear nuevo timeout para debounce (500ms)
  searchTimeout.value = setTimeout(() => {
    performSearch(newValue);
  }, 500);
});

// Función para limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = '';
  searchSugg.value = [];
  isLoading.value = false;
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- Global search -->
    <!-- ------------------------------------------------>
    <v-menu :close-on-content-click="false" location="bottom start" offset="8">
        <template v-slot:activator="{ props }">
            <v-btn 
                icon 
                class="search-btn custom-hover-primary" 
                size="small" 
                variant="flat" 
                color="primary" 
                v-bind="props" 
                rounded="lg"
            >
                <Icon icon="solar:magnifer-linear" height="20" />
            </v-btn>
        </template>
        <v-sheet width="450" elevation="16" rounded="xl" class="search-dropdown">
            <!-- Header mejorado -->
            <div class="search-header pa-5">
                <div class="d-flex align-center justify-space-between">
                    <div class="d-flex gap-3 align-center">
                        <div class="search-icon-wrapper">
                            <Icon icon="solar:magnifer-linear" height="26" width="26" class="search-icon" />
                        </div>
                        <div>
                            <h6 class="text-h6 font-weight-bold mb-0 search-title">Búsqueda Global</h6>
                            <p class="text-caption text-medium-emphasis mb-0 mt-1">Encuentra proyectos, ofertas y usuarios</p>
                        </div>
                    </div>
                    <v-btn 
                        icon 
                        size="small" 
                        variant="text" 
                        @click="clearSearch"
                        class="clear-btn"
                        v-if="searchQuery"
                    >
                        <Icon icon="solar:close-circle-bold" height="20" />
                    </v-btn>
                </div>
            </div>
            
            <v-divider class="search-divider"></v-divider>
            
            <!-- Campo de búsqueda mejorado -->
            <div class="search-input-wrapper pa-4">
                <v-text-field
                    color="primary" 
                    density="comfortable" 
                    variant="outlined" 
                    hide-details
                    v-model="searchQuery"
                    placeholder="Escribe para buscar..."
                    prepend-inner-icon="mdi-magnify"
                    class="search-input-modern"
                    rounded="lg"
                    autofocus
                    clearable
                    @click:clear="clearSearch"
                >
                    <template v-slot:append-inner v-if="isLoading">
                        <v-progress-circular
                            indeterminate
                            size="20"
                            width="2"
                            color="primary"
                        ></v-progress-circular>
                    </template>
                </v-text-field>
            </div>
            
            <v-divider class="search-divider mx-4"></v-divider>
            
            <!-- Resultados -->
            <perfect-scrollbar style="max-height: 420px">
                <div class="search-results-container">
                    <!-- Estado de carga -->
                    <div v-if="isLoading && searchQuery" class="loading-state pa-8">
                        <v-progress-circular
                            indeterminate
                            size="48"
                            width="4"
                            color="primary"
                            class="mb-4"
                        ></v-progress-circular>
                        <p class="text-subtitle-1 text-medium-emphasis">Buscando...</p>
                    </div>
                    
                    <!-- Resultados encontrados -->
                    <v-list v-else-if="searchSugg.length > 0" class="pt-2 pb-5 search-results-list" lines="two">
                        <div class="px-4 py-2 results-header">
                            <span class="text-caption font-weight-semibold text-primary">
                                {{ searchSugg.length }} resultado{{ searchSugg.length !== 1 ? 's' : '' }} encontrado{{ searchSugg.length !== 1 ? 's' : '' }}
                            </span>
                        </div>
                        <v-list-item
                            v-for="(item, index) in searchSugg"
                            :key="index"
                            :href="item.href"
                            color="primary"
                            class="px-5 py-4 search-result-item"
                            :class="`result-${item.source}`"
                        >
                            <!-- Vacante -->
                            <div v-if="item.source === 'vacant'" class="d-flex align-center w-100">
                                <v-avatar size="48" class="search-avatar-modern vacant-avatar">
                                    <Icon icon="solar:card-search-line-duotone" height="24" />
                                </v-avatar>
                                <div class="ml-4 flex-grow-1">
                                    <div class="d-flex align-center gap-2 mb-1">
                                        <h6 class="text-subtitle-1 mb-0 font-weight-semibold result-title">{{ item.vacant_name }}</h6>
                                        <v-chip size="x-small" color="error" variant="flat" class="source-chip">Vacante</v-chip>
                                    </div>
                                    <p class="text-body-2 text-medium-emphasis mb-0 result-subtitle">
                                        <Icon icon="solar:buildings-bold-duotone" height="14" class="mr-1" />
                                        {{ item.vacant_company }}
                                    </p>
                                </div>
                                <Icon icon="solar:arrow-right-linear" height="20" class="result-arrow" />
                            </div>
                            
                            <!-- Proyecto -->
                            <div v-else-if="item.source === 'project'" class="d-flex align-center w-100">
                                <v-avatar size="48" class="search-avatar-modern project-avatar">
                                    <Icon icon="solar:passport-line-duotone" height="24" />
                                </v-avatar>
                                <div class="ml-4 flex-grow-1">
                                    <div class="d-flex align-center gap-2 mb-1">
                                        <h6 class="text-subtitle-1 mb-0 font-weight-semibold result-title">{{ item.project_name }}</h6>
                                        <v-chip size="x-small" color="warning" variant="flat" class="source-chip">Proyecto</v-chip>
                                    </div>
                                    <p class="text-body-2 text-medium-emphasis mb-0 result-subtitle">
                                        <Icon icon="solar:check-circle-bold-duotone" height="14" class="mr-1" />
                                        Estado: {{ item.project_status.toUpperCase() }}
                                    </p>
                                </div>
                                <Icon icon="solar:arrow-right-linear" height="20" class="result-arrow" />
                            </div>
                            
                            <!-- Usuario -->
                            <div v-else-if="item.source === 'user'" class="d-flex align-center w-100">
                                <v-avatar size="48" class="search-avatar-modern user-avatar">
                                    <Icon icon="solar:user-bold-duotone" height="24" />
                                </v-avatar>
                                <div class="ml-4 flex-grow-1">
                                    <div class="d-flex align-center gap-2 mb-1">
                                        <h6 class="text-subtitle-1 mb-0 font-weight-semibold result-title">
                                            {{ item.user_name }} {{ item.user_lastName }}
                                        </h6>
                                        <v-chip size="x-small" color="primary" variant="flat" class="source-chip">Usuario</v-chip>
                                    </div>
                                    <p class="text-body-2 text-medium-emphasis mb-0 result-subtitle">
                                        <Icon icon="solar:user-id-bold-duotone" height="14" class="mr-1" />
                                        {{ item.user_role.toUpperCase() }}
                                    </p>
                                </div>
                                <Icon icon="solar:arrow-right-linear" height="20" class="result-arrow" />
                            </div>
                        </v-list-item>
                    </v-list>
                    
                    <!-- Estado vacío -->
                    <div v-else-if="!isLoading && searchQuery && searchSugg.length === 0" class="empty-state pa-8">
                        <div class="empty-state-content">
                            <div class="empty-icon-wrapper mb-4">
                                <Icon icon="solar:magnifer-linear" height="64" width="64" class="empty-icon" />
                            </div>
                            <h6 class="text-subtitle-1 font-weight-semibold mb-2">No se encontraron resultados</h6>
                            <p class="text-body-2 text-medium-emphasis mb-0">
                                Intenta con otros términos de búsqueda
                            </p>
                        </div>
                    </div>
                    
                    <!-- Estado inicial -->
                    <div v-else-if="!searchQuery" class="initial-state pa-8">
                        <div class="initial-state-content">
                            <div class="initial-icon-wrapper mb-4">
                                <Icon icon="solar:magnifer-linear" height="64" width="64" class="initial-icon" />
                            </div>
                            <h6 class="text-subtitle-1 font-weight-semibold mb-2">Comienza a buscar</h6>
                            <p class="text-body-2 text-medium-emphasis mb-0">
                                Escribe en el campo de arriba para encontrar proyectos, ofertas y usuarios
                            </p>
                        </div>
                    </div>
                </div>
            </perfect-scrollbar>
        </v-sheet>
    </v-menu>
</template>

<style scoped>
/* Botón de búsqueda principal */
.search-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-btn:hover {
    transform: scale(1.08) translateY(-1px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
}

/* Dropdown principal */
.search-dropdown {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.99) 0%, rgba(249, 250, 251, 0.99) 100%) !important;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(99, 102, 241, 0.12);
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Header mejorado */
.search-header {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-radius: 16px 16px 0 0;
    margin: -8px -8px 0 -8px;
    position: relative;
    overflow: hidden;
}

.search-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.6) 0%, rgba(168, 85, 247, 0.6) 100%);
}

.search-icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.search-icon {
    color: rgb(99, 102, 241);
}

.search-title {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.clear-btn {
    transition: all 0.2s ease;
    color: rgba(99, 102, 241, 0.7);
}

.clear-btn:hover {
    color: rgb(99, 102, 241);
    transform: scale(1.1) rotate(90deg);
}

.search-divider {
    border-color: rgba(99, 102, 241, 0.1) !important;
}

/* Input de búsqueda moderno */
.search-input-wrapper {
    position: relative;
}

.search-input-modern :deep(.v-field) {
    border-radius: 12px !important;
    background-color: #ffffff !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 2px solid rgba(99, 102, 241, 0.1);
}

.search-input-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.2);
}

.search-input-modern :deep(.v-field--focused) {
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.2) !important;
    border-color: rgba(99, 102, 241, 0.4) !important;
    transform: translateY(-1px);
}

.search-input-modern :deep(.v-field__input) {
    padding: 12px 16px;
    font-size: 0.95rem;
}

/* Contenedor de resultados */
.search-results-container {
    min-height: 200px;
}

.results-header {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 8px;
    margin: 8px 16px;
}

/* Estados de carga y vacío */
.loading-state,
.empty-state,
.initial-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    text-align: center;
}

.empty-icon-wrapper,
.initial-icon-wrapper {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
}

.empty-icon,
.initial-icon {
    color: rgba(99, 102, 241, 0.4);
}

/* Lista de resultados */
.search-results-list {
    background: transparent !important;
}

.search-result-item {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    margin: 6px 12px;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
}

.search-result-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, rgba(99, 102, 241, 0) 0%, rgba(99, 102, 241, 0.5) 50%, rgba(99, 102, 241, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.search-result-item:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%) !important;
    transform: translateX(6px);
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.search-result-item:hover::before {
    opacity: 1;
}

/* Avatares modernos */
.search-avatar-modern {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
}

.vacant-avatar {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(244, 67, 54, 0.08) 100%) !important;
    color: #f44336 !important;
}

.project-avatar {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 152, 0, 0.08) 100%) !important;
    color: #ff9800 !important;
}

.user-avatar {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.08) 100%) !important;
    color: #6366f1 !important;
}

.search-result-item:hover .search-avatar-modern {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Títulos y subtítulos */
.result-title {
    color: #1e293b;
    transition: all 0.2s ease;
    line-height: 1.4;
}

.search-result-item:hover .result-title {
    color: rgb(99, 102, 241);
}

.result-subtitle {
    display: flex;
    align-items: center;
    line-height: 1.5;
}

.source-chip {
    font-weight: 600;
    letter-spacing: 0.3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-arrow {
    color: rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.search-result-item:hover .result-arrow {
    color: rgb(99, 102, 241);
    transform: translateX(4px);
}

/* Animaciones adicionales */
.search-result-item {
    animation: fadeIn 0.3s ease forwards;
    opacity: 0;
}

@keyframes fadeIn {
    to {
        opacity: 1;
    }
}

.search-result-item:nth-child(1) { animation-delay: 0.05s; }
.search-result-item:nth-child(2) { animation-delay: 0.1s; }
.search-result-item:nth-child(3) { animation-delay: 0.15s; }
.search-result-item:nth-child(4) { animation-delay: 0.2s; }
.search-result-item:nth-child(5) { animation-delay: 0.25s; }
</style>
