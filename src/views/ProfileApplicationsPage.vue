<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import axios from 'axios';

const authStore = useAuthStore();
const userId = authStore.userId;
const userRole = authStore.userRole;

// components
import ProfileBanner from '@/components/profile/ProfileBanner.vue';
import IntroCard from '@/components/profile/IntroCard.vue';

// Definir la referencia para los posts
const vacantsArray = ref<any[]>([]);
const page = ref({ title: 'Perfil de usuario' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '/' },
    { text: 'Ofertas Laborales', disabled: true, href: '#' }
]);

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    if (userRole.toLowerCase() === 'estudiante') {
      const response = await axios.get('http://localhost:3000/applications/list-vacants/by-user/' + userId);
      console.log(response.data);
      vacantsArray.value = response.data;     
    }
    if (userRole.toLowerCase() === 'reclutador') {
      const response = await axios.get('http://localhost:3000/vacancies/list/' + userId);
      console.log(response.data);
      vacantsArray.value = response.data;  
    }
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
  }
});

</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner />
    <v-col v-for="vacant in vacantsArray" :key="vacant.id" cols="12" md="12">
        <VacantContent :vacant="vacant"/>
    </v-col>
</template>
