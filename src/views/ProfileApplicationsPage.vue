<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import VacantContent from '@/components/vacancies/VacantContent.vue';
import ProfileBanner from '@/components/profile/ProfileBanner.vue';

const route = useRoute();

const usuarioId = route.params.id;
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
    const getUser = await axios.get('http://localhost:3000/users/user/' + usuarioId);
    if (getUser.data && getUser.data.role.toLowerCase() === 'estudiante') {
      const response = await axios.get('http://localhost:3000/applications/list-vacants/by-user/' + usuarioId);
      vacantsArray.value = response.data;     
    }
    if (getUser.data && getUser.data.role.toLowerCase() === 'reclutador') {
      const response = await axios.get('http://localhost:3000/vacancies/list/' + usuarioId);
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
