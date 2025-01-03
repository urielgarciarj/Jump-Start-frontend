<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const emit = defineEmits<{
  (e: 'postCreated', newPost: any): void;
}>();
const isActive = ref(false);
const post = ref({
    title: '',
    description: '',
    category: '',
    dateCreated: new Date().toISOString(),
    userId: userId
});
const file = ref<File | null>(null);
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
            const formData = new FormData();
            formData.append('title', post.value.title);
            formData.append('description', post.value.description);
            formData.append('category', post.value.category);
            formData.append('dateCreated', post.value.dateCreated);
            formData.append('userId', post.value.userId);
            
            // Si hay una imagen seleccionada, agregarla al FormData
            if (file.value) {
                formData.append('file', file.value);
            }
            const response = await axios.post('http://localhost:3000/posts/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            //console.log('Post created:', response.data);
            
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
                userId: ''
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

// Función para manejar el cambio de archivo
const handleFileChange = (event: Event) => {
    const inputEvent = event.target as HTMLInputElement;
    if (inputEvent.files && inputEvent.files.length > 0) {
        file.value = inputEvent.files[0];  // Guardamos solo el primer archivo
    }
};

</script>

<template>
    <v-form v-model="valid" @submit.prevent="createPost" enctype="multipart/form-data">
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
                                <v-alert v-if="error" type="error" dismissible>
                                    {{ error }}
                                </v-alert>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="post.title" :rules="notEmptyRule" label="Titulo" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="post.description" :rules="notEmptyRule" label="Descripción" required></v-textarea>
                            </v-col>
                            <v-col cols="12">
                                <v-select v-model="post.category" :rules="notEmptyRule"
                                    :items="categories"
                                    label="Categoría"
                                    required>
                                </v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-file-input @change="handleFileChange" accept="image/*" label="Adjuntar imagen" hide-details variant="outlined"> </v-file-input>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="tonal" @click="isActive.value = false" flat>Cancelar</v-btn>
                        <v-btn :disabled="!valid" color="primary" variant="tonal" @click="createPost" flat>Guardar</v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>
