<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import ProfileBanner from '@/components/profile/ProfileBanner.vue';

const authStore = useAuthStore();
const route = useRoute();
// Valores computados para establecer al usuario
const loggedInUserId = computed(() => authStore.userId || '');
const userId = computed(() => {
  return (route.params.id as string) || loggedInUserId.value;
});
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
    const getUser = await axios.get('http://localhost:3000/users/user/' + userId);
    if (getUser.data && getUser.data.role.toLowerCase() === 'estudiante') {
      const response = await axios.get('http://localhost:3000/applications/list-vacants/by-user/' + userId);
      vacantsArray.value = response.data;     
    }
    if (getUser.data && getUser.data.role.toLowerCase() === 'reclutador') {
      const response = await axios.get('http://localhost:3000/vacancies/list/' + userId);
      vacantsArray.value = response.data;  
    }
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
  }
});

</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :userId="userId"
    />
    <v-col v-for="vacant in vacantsArray" :key="vacant.id" cols="12" md="12">
        <VacantContent :vacant="vacant"/>
    </v-col>
</template>
