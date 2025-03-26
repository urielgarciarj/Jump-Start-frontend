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
const loggedInUserId = computed(() => authStore.userId || '');
const userId = computed(() => {
  return (route.params.id as string) || loggedInUserId.value;
});

const page = ref({ title: 'Perfil de usuario' });
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
    const getUser = await axios.get('http://localhost:3000/users/user/' + userId);
    console.log('getUser', getUser.data)
    if (getUser.data && getUser.data.role.toLowerCase() === 'estudiante') {
      const response = await axios.get('http://localhost:3000/enrolls/list-projects/by-user-enrolled/' + userId);
      projectsArray.value = response.data;     
    }
    if (getUser.data && getUser.data.role.toLowerCase() === 'docente') {
      const response = await axios.get('http://localhost:3000/projects/list/' + userId);
      console.log('docente', response)
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
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner />
    <v-row class="d-flex my-5 justify-end">
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
    <v-row>
        <template v-for="project in filteredProjects" :key="project.id">
            <ProjectContent :project="project"/>
        </template>
    </v-row>
</template>
