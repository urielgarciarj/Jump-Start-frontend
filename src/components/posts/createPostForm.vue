<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';

const emit = defineEmits<{
  (e: 'postCreated', newPost: any): void;
}>();
const isActive = ref(false);
const post = ref({
    title: '',
    description: '',
    category: '',
    dateCreated: new Date().toISOString(),
    mediaUrl: 'www.icarly.com',
    userId: '11'
});

const valid = ref(false);
const categories = ref([
    "Investigación y Ciencia", "Recursos Académicos", "Consejos de Estudio", "Tecnología y Herramientas de Estudio",
    "Vida Universitaria", "Desarrollo Personal y Profesional", "Intereses y Hobbies", "Innovación y Emprendimiento", "Cultura y Diversidad"
]);
// Reglas de validación
const notEmptyRule = [
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];

const error = ref<string | null>(null);

const createPost = async () => {
    if (valid.value) {
        try {
            const response = await axios.post('http://localhost:3000/posts/create', post.value);
            console.log('Post created:', response.data);
            
            // Emitir el evento con el nuevo post
            const newPost = response.data;
            emit('postCreated', newPost);
            isActive.value = false; // Close dialog
            // Limpiar el formulario
            post.value = {
                title: '',
                description: '',
                category: '',
                dateCreated: '',
                mediaUrl: 'www.icarly.com',
                userId: '11'
            };
        } catch (err) {
            console.error('Error:', err);
            // Tipar el error como AxiosError
            const errorAxios = err as AxiosError;
            // Manejar el error en función del código de estado
            if (errorAxios.response) {
                error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};
</script>

<template>
    <v-form v-model="valid" @submit.prevent="createPost">
        <v-dialog v-model="isActive"  transition="dialog-bottom-transition" class="dialog-mw">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="w-100" v-bind="props" flat>Nueva publicación</v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card>
                    <v-toolbar color="primary" class="px-6">Nueva publicación</v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="post.title" :rules="notEmptyRule" label="Titulo" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="post.description" :rules="notEmptyRule" label="Descripción" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-select v-model="post.category" :rules="notEmptyRule"
                                    :items="categories"
                                    label="Categoría"
                                    required>
                                </v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-file-input multiple label="Adjuntar" hide-details variant="outlined"> </v-file-input>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="tonal" @click="isActive.value = false" flat>Cancelar</v-btn>
                        <v-btn color="primary" variant="tonal" @click="createPost" flat>Guardar</v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>
