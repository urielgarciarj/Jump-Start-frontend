<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';
// components
import ProfileBanner from '@/components/profile/ProfileBanner.vue';

const authStore = useAuthStore();
const route = useRoute();
// Valores computados para establecer al usuario
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;

const pageTitle = computed(() => isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario');
const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        href: '/'
    },
    {
        text: 'Perfil de Usuario',
        disabled: true,
        href: '#'
    }
]);

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    
  } catch (error) {
    console.error('Error al obtener los posts:', error);
  }
});
</script>

<template>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :userId="userId"
    />

    <v-card class="mb-3 pa-5 my-5">
          Aqui pondria mi CV.
          SI TUVIERA UNO!
    </v-card>
</template>
