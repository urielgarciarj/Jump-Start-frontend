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
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn icon class="custom-hover-primary" size="small" variant="text" color="primary" v-bind="props">
                <Icon icon="solar:magnifer-linear" height="20" />
            </v-btn>
        </template>
        <v-sheet width="360" elevation="10" rounded="md">
            <div class="d-block d-sm-flex gap-3 align-center mb-4 px-4 pt-4">
                <!-- Usamos v-model para vincular el valor del campo de texto -->
                <v-text-field
                    color="primary" 
                    density="compact" 
                    variant="outlined" 
                    hide-details
                    v-model="searchQuery"
                />
                <!-- Botón de búsqueda que dispara la función handleSearch -->
                <v-btn color="primary" @click="handleSearch">
                    Buscar
                </v-btn>
            </div>
            <v-divider></v-divider>
            <perfect-scrollbar style="max-height: 380px">
                <v-list class="pt-0 pb-5" lines="two">
                    <v-list-item
                        v-for="(item, index) in searchSugg"
                        :key="index"
                        :href="item.href"
                        color="primary"
                        class="px-5 py-2"
                    >
                    <div v-if="item.source === 'vacant'" class="d-flex align-center">
                        <v-avatar size="35" color="error" rounded="md">
                            <Icon icon="solar:card-search-line-duotone" height="20"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 mb-1 heading custom-title">{{ item.vacant_name }}</h6>
                            <p class="text-subtitle-2 textSecondary">{{ item.vacant_company }}</p>
                        </div>
                    </div>
                    <div v-else-if="item.source === 'project'" class="d-flex align-center">
                        <v-avatar size="35" color="warning" rounded="md">
                            <Icon icon="solar:passport-line-duotone" height="20"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 mb-1 heading custom-title">{{ item.project_name }}</h6>
                            <p class="text-subtitle-2 textSecondary">Estado: {{ item.project_status.toUpperCase() }}</p>
                        </div>
                    </div>
                    <div v-else-if="item.source === 'user'" class="d-flex align-center">
                        <v-avatar size="35" color="secondary" rounded="md">
                            <Icon icon="solar:user-bold-duotone" height="20"/>
                        </v-avatar>
                        <div class="ml-3">
                            <h6 class="text-subtitle-1 mb-1 heading custom-title">{{ item.user_name }} {{ item.user_lastName }}</h6>
                            <p class="text-subtitle-2 textSecondary">{{ item.user_role.toUpperCase() }}</p>
                        </div>
                    </div>
                    </v-list-item>
                </v-list>
            </perfect-scrollbar>
        </v-sheet>
    </v-menu>
</template>
