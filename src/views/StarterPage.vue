<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import PostForm from '@/components/posts/createPostForm.vue';
import PostItem from '@/components/posts/PostItem.vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId; // Obtener el userId desde el store

const page = ref({ title: 'Publicaciones' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Inicio', disabled: true, href: '#' }
]);
// Searching for posts
const searchQuery = ref();
// Definir la referencia para los posts
const posts = ref<any[]>([]);
const showAlert = ref(false); // Controlar la visibilidad del snackbar
const snackbarMessage = ref(''); // Mensaje para mostrar en el snackbar

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/posts/list/sorted/newest-date');
    posts.value = response.data;
  } catch (error) {
    console.error('Error al obtener los posts:', error);
  }
});

// Computed property para filtrar los posts según el título
const filteredPosts = computed(() => {
  if (!searchQuery.value) {
    return posts.value;
  }

  const query = searchQuery.value.toLowerCase();
  return posts.value.filter(post => post.title.toLowerCase().includes(query));
});

// Función para actualizar la lista de posts cuando se crea un nuevo post
const addNewPost = (newPost: any) => {
  posts.value.unshift(newPost);
  snackbarMessage.value = '¡Nueva publicación creada con éxito!';
  showAlert.value = true;
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
};

// Elimina el post del array filtrando el que se ha eliminado
const handlePostDelete = (deletedPostId: string) => {
  posts.value = posts.value.filter(post => post.id !== deletedPostId);
};

</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-alert v-if="showAlert" type="success" variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert>
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
        <v-col cols="12" sm="6" class="d-flex justify-end">
            <PostForm @postCreated="addNewPost"/>
        </v-col>
    </v-row>
    <v-row>
        <v-col v-for="post in filteredPosts" :key="post.id" cols="12" md="12">
          <PostItem :post="post"  @deletePost="handlePostDelete"/>
        </v-col>
    </v-row>
</template>

