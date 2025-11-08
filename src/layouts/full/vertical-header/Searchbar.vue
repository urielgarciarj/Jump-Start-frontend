<script setup>
import { Icon } from '@iconify/vue';
import { ref } from 'vue';  // Importamos ref para las variables reactivas
import axios from 'axios';

// Variable reactiva para almacenar los resultados
const searchQuery = ref('');
const searchSugg = ref([]);

// Función para hacer la búsqueda
const handleSearch = async () => {
  const query = searchQuery.value.trim();  // Usamos trim para eliminar espacios innecesarios
  if (query) {
    try {
      // Reemplaza 'your-endpoint-url' con la URL de tu endpoint en Nest.js
      const response = await axios.get(`http://localhost:3000/global-search/search/${query}`);
      console.log('response', response.data)
      searchSugg.value = response.data;  // Asignar los resultados de búsqueda a la variable reactiva
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    }
  } else {
    searchSugg.value = [];  // Limpiar los resultados si la búsqueda está vacía
  }
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- Global search -->
    <!-- ------------------------------------------------>
    <v-menu :close-on-content-click="false" location="bottom start">
        <template v-slot:activator="{ props }">
            <v-btn icon class="search-btn custom-hover-primary" size="small" variant="flat" color="primary" v-bind="props" rounded="lg">
                <Icon icon="solar:magnifer-linear" height="20" />
            </v-btn>
        </template>
        <v-sheet width="400" elevation="12" rounded="lg" class="search-dropdown">
            <div class="search-header pa-4">
                <div class="d-flex gap-2 align-center">
                    <Icon icon="solar:magnifer-linear" height="24" width="24" class="search-icon" />
                    <h6 class="text-h6 font-weight-bold mb-0">Búsqueda Global</h6>
                </div>
            </div>
            <v-divider></v-divider>
            <div class="d-block d-sm-flex gap-2 align-center mb-4 px-4 pt-4">
                <!-- Usamos v-model para vincular el valor del campo de texto -->
                <v-text-field
                    color="primary" 
                    density="compact" 
                    variant="outlined" 
                    hide-details
                    v-model="searchQuery"
                    placeholder="Buscar proyectos, ofertas, usuarios..."
                    prepend-inner-icon="mdi-magnify"
                    class="search-input"
                    rounded="lg"
                />
                <!-- Botón de búsqueda que dispara la función handleSearch -->
                <v-btn color="primary" @click="handleSearch" rounded="lg" class="search-action-btn">
                    Buscar
                </v-btn>
            </div>
            <v-divider class="mx-4"></v-divider>
            <perfect-scrollbar style="max-height: 380px">
                <v-list class="pt-2 pb-5 search-results-list" lines="two">
                    <v-list-item
                        v-for="(item, index) in searchSugg"
                        :key="index"
                        :href="item.href"
                        color="primary"
                        class="px-5 py-3 search-result-item"
                    >
                    <div v-if="item.source === 'vacant'" class="d-flex align-center">
                        <v-avatar size="40" class="search-avatar" style="background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05));">
                            <Icon icon="solar:card-search-line-duotone" height="22" style="color: #f44336;"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 mb-1 heading custom-title font-weight-semibold">{{ item.vacant_name }}</h6>
                            <p class="text-subtitle-2 text-medium-emphasis">{{ item.vacant_company }}</p>
                        </div>
                    </div>
                    <div v-else-if="item.source === 'project'" class="d-flex align-center">
                        <v-avatar size="40" class="search-avatar" style="background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05));">
                            <Icon icon="solar:passport-line-duotone" height="22" style="color: #ff9800;"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 mb-1 heading custom-title font-weight-semibold">{{ item.project_name }}</h6>
                            <p class="text-subtitle-2 text-medium-emphasis">Estado: {{ item.project_status.toUpperCase() }}</p>
                        </div>
                    </div>
                    <div v-else-if="item.source === 'user'" class="d-flex align-center">
                        <v-avatar size="40" class="search-avatar" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05));">
                            <Icon icon="solar:user-bold-duotone" height="22" style="color: #6366f1;"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 mb-1 heading custom-title font-weight-semibold">{{ item.user_name }} {{ item.user_lastName }}</h6>
                            <p class="text-subtitle-2 text-medium-emphasis">{{ item.user_role.toUpperCase() }}</p>
                        </div>
                    </div>
                    </v-list-item>
                    <v-list-item v-if="searchSugg.length === 0 && searchQuery" class="px-5 py-8 text-center">
                        <div class="text-center w-100">
                            <Icon icon="solar:magnifer-linear" height="48" width="48" class="mb-3" style="color: rgba(99, 102, 241, 0.3);" />
                            <p class="text-subtitle-1 text-medium-emphasis">No se encontraron resultados</p>
                        </div>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
        </v-sheet>
    </v-menu>
</template>

<style scoped>
.search-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s ease;
}

.search-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}

.search-dropdown {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(249, 250, 251, 0.98) 100%) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.search-header {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 12px 12px 0 0;
    margin: -6px -6px 0 -6px;
}

.search-icon {
    color: rgba(99, 102, 241, 0.8);
}

.search-input {
    flex: 1;
}

.search-action-btn {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25) !important;
    transition: all 0.3s ease;
}

.search-action-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.35) !important;
}

.search-results-list {
    background: transparent !important;
}

.search-result-item {
    transition: all 0.2s ease;
    border-radius: 8px;
    margin: 4px 8px;
}

.search-result-item:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%) !important;
    transform: translateX(4px);
}

.search-avatar {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.search-result-item:hover .search-avatar {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
