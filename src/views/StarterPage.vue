<script setup lang="ts">
import { onMounted, ref } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
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
    const response = await axios.get('http://localhost:3000/posts/list/all');
    posts.value = response.data;
  } catch (error) {
    console.error('Error al obtener los posts:', error);
  }
});
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-row>
        <v-col cols="12" md="12">
            <v-dialog transition="dialog-bottom-transition" class="dialog-mw">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" class="w-100" v-bind="props" flat>Nueva publicación</v-btn>
                </template>
                <template v-slot:default="{ isActive }">
                    <v-card>
                        <v-toolbar color="primary" class="px-6">Nueva publicación</v-toolbar>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                <v-text-field label="Titulo" required></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                <v-text-field
                                    label="Descripción"
                                    required
                                ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                <v-select
                                    :items="['0-17', '18-29', '30-54', '54+']"
                                    label="Age*"
                                    required
                                ></v-select>
                                </v-col>
                                <v-col cols="12" sm="6">
                                <v-autocomplete
                                    :items="[
                                    'Skiing',
                                    'Ice hockey',
                                    'Soccer',
                                    'Basketball',
                                    'Hockey',
                                    'Reading',
                                    'Writing',
                                    'Coding',
                                    'Basejump',
                                    ]"
                                    label="Interests"
                                    multiple
                                ></v-autocomplete>
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions class="justify-end">
                            <v-btn variant="tonal" @click="isActive.value = false" flat>Cancelar</v-btn>
                            <v-btn color="primary" variant="tonal" @click="isActive.value = false" flat>Guardar</v-btn>
                        </v-card-actions>
                    </v-card>
                </template>
            </v-dialog>
        </v-col>
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

