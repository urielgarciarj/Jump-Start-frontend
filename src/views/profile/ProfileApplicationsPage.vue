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
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;

// Definir la referencia para los posts
const vacantsArray = ref<any[]>([]);
const pageTitle = computed(() => isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario');
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '/' },
    { text: 'Ofertas Laborales', disabled: true, href: '#' }
]);

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const getUser = await axios.get('http://localhost:3000/users/user/' + userId.value);
    if (getUser.data && getUser.data.role.toLowerCase() === 'estudiante') {
      const response = await axios.get('http://localhost:3000/applications/list-vacants/by-user/' + userId.value);
      vacantsArray.value = response.data;     
    }
    if (getUser.data && getUser.data.role.toLowerCase() === 'reclutador') {
      const response = await axios.get('http://localhost:3000/vacancies/list/' + userId.value);
      vacantsArray.value = response.data;  
    }
  } catch (error) {
    console.error('Error al obtener vacantes:', error);
  }
});

</script>

<template>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :userId="userId"
    />

    <v-row class="d-flex my-5 justify-center">
      <v-col v-if="vacantsArray.length === 0" cols="12" class="d-flex">
        <v-card v-if="vacantsArray.length === 0" class="pa-4 mb-4 my-5 text-center" variant="outlined" >
          <v-icon icon="mdi-post" size="large" class="mb-2"></v-icon>
            <h3 class="text-h6 mb-2">No hay vacantes disponibles</h3>
            <p class="text-body-2 text-medium-emphasis">
                {{ isOwnProfile ? 'Aún no has creado ninguna vacante.' : 'Este usuario aún no ha registrado vacantes.' }}
            </p>
        </v-card>
      </v-col>
      <v-col v-for="vacant in vacantsArray" :key="vacant.id" cols="12" md="12">
          <VacantContent :vacant="vacant"/>
      </v-col>
    </v-row>
</template>
