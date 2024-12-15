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

// Definir la referencia para los posts
const posts = ref<any[]>([]);

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
};
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12" sm="2">
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

