<script setup lang="ts">
import { ref, onMounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';
import PostItem from '@/components/posts/PostItem.vue';
import axios from 'axios';

const authStore = useAuthStore();
const userId = authStore.userId;

// components
import ProfileBanner from '@/components/profile/ProfileBanner.vue';
import IntroCard from '@/components/profile/IntroCard.vue';

// Definir la referencia para los posts
const posts = ref<any[]>([]);

const page = ref({ title: 'Perfil de usuario' });
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
    const response = await axios.get('http://localhost:3000/posts/list/user/' + userId);
    console.log(response.data);
    posts.value = response.data;
  } catch (error) {
    console.error('Error al obtener los posts:', error);
  }
});

// Elimina el post del array filtrando el que se ha eliminado
const handlePostDelete = (deletedPostId: string) => {
  posts.value = posts.value.filter(post => post.id !== deletedPostId);
};

</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner />
</template>
