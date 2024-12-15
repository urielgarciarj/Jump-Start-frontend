<script setup lang="ts">
import { onMounted, ref } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import PostForm from '@/components/posts/createPostForm.vue';
import axios from 'axios';

const page = ref({ title: 'Publicaciones' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Inicio', disabled: true, href: '#' }
]);
// Searching for posts
const search = ref();
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
// Función para actualizar la lista de posts cuando se crea un nuevo post
const addNewPost = (newPost: any) => {
  posts.value.unshift(newPost);
  // Mostrar la notificación de éxito
  snackbarMessage.value = '¡Nueva publicación creada con éxito!';
  showAlert.value = true; // Hacer visible el snackbar
  // Cerrar la alerta después de 3 segundos (opcional)
  setTimeout(() => {
    showAlert.value = false;
  }, 5000);
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
        <v-col v-for="post in posts" :key="post.id" cols="12" md="12">
            <v-card elevation="10">
                <v-card-item>
                    <v-card-title class="text-h5">{{ post.title }}</v-card-title>
                    <v-card-subtitle class="text-subtitle-1 textSecondary">{{ post.dateCreated }}</v-card-subtitle>
                    <v-divider />
                    <v-chip color="secondary" variant="outlined" size="default" class="text-body-2" rounded="sm"> {{ post.category }} </v-chip>
                    <v-card-text>{{ post.description }}</v-card-text>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>

