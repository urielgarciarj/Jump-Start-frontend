<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ProjectContent from '@/components/projects/ProjectContent.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userRole = authStore.userRole;

const page = ref({ title: 'Proyectos Académicos' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Proyectos', disabled: true, href: '#' }
]);

const projects = ref<any[]>([]);
const searchQuery = ref();

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/projects/list');
    projects.value = response.data;
  } catch (error) {
    console.error('Error al obtener el listado de proyectos:', error);
  }
});

const filteredProjects = computed(() => {
  if (!searchQuery.value) {
    return projects.value;
  }
  const query = searchQuery.value.toLowerCase();
  return projects.value.filter(project => project.name.toLowerCase().includes(query) || project.category.toLowerCase().includes(query));
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row class="d-flex align-center" no-gutters>
        <v-col cols="12" sm="6" class="d-flex justify-start">
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
    </v-row>
    <v-row>
        <template v-for="project in filteredProjects" :key="project.id">
            <ProjectContent :project="project"/>
        </template>
    </v-row>
</template>