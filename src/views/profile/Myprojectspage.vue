<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ProfileBanner from '@/components/profile/ProfileBanner.vue';
import ProjectContent from '@/components/projects/ProjectContent.vue';
import axios from 'axios';

const authStore = useAuthStore();
const route = useRoute();

// Valores computados para establecer al usuario
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;

const pageTitle = computed(() => isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario');
const breadcrumbs = ref([
  { text: 'Dashboard', disabled: false, href: '/' },
  { text: 'Perfil de Usuario', disabled: true, href: '#' }
]);

// Definir la referencia para los posts
const projectsArray = ref<any[]>([]);
const searchQuery = ref();

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const getUser = await axios.get('http://localhost:3000/users/user/' + userId.value);
    if (getUser.data && getUser.data.role.toLowerCase() === 'estudiante') {
      const response = await axios.get('http://localhost:3000/enrolls/list-projects/by-user-enrolled/' + userId.value);
      projectsArray.value = response.data;     
    }
    if (getUser.data && getUser.data.role.toLowerCase() === 'docente') {
      const response = await axios.get('http://localhost:3000/projects/list/' + userId.value);
      projectsArray.value = response.data;  
    }
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
  }
});

const filteredProjects = computed(() => {
  if (!searchQuery.value) {
    return projectsArray.value;
  }
  const query = searchQuery.value.toLowerCase();
  return projectsArray.value.filter(project => project.status.toLowerCase().includes(query));
});

</script>

<template>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :userId="userId"
    />
    <v-row v-if="filteredProjects.length > 0" class="d-flex my-5 justify-end">
        <v-col cols="12" sm="6" class="d-flex justify-end">
          <v-select
            v-model="searchQuery"
            :items="['Abierto', 'Progreso', 'Completado', 'Cancelado']"
            label="Filtrar por estado"
            variant="outlined"
            density="compact"
            color="primary"
          ></v-select>
        </v-col>
    </v-row>
    <v-row class="d-flex my-5">
      <v-col cols="12" class="d-flex">
        <v-card v-if="filteredProjects.length === 0" class="pa-4 mb-4 my-5 text-center" variant="outlined" >
          <v-icon icon="mdi-post" size="large" class="mb-2"></v-icon>
            <h3 class="text-h6 mb-2">No hay proyectos disponibles</h3>
            <p class="text-body-2 text-medium-emphasis">
                {{ isOwnProfile ? 'Aún no has creado ningún proyecto.' : 'Este usuario aún no tiene proyectos registrados.' }}
            </p>
        </v-card>
        <template v-for="project in filteredProjects" :key="project.id">
            <ProjectContent :project="project"/>
        </template>
      </v-col>
    </v-row>
</template>
