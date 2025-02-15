<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const emit = defineEmits<{
  (e: 'enrollCreated', newPost: any): void;
}>();

const isActive = ref(false);
const enroll = ref({
    name: '',
    comments: '',
    dateCreated: new Date().toISOString(),
    userId: userId
});

const valid = ref(false);
const error = ref<string | null>(null);
const notEmptyRule = [ // Reglas de validación
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];

const submitEnroll = async () => {
    if (valid.value) {
        try {
            // const formData = new FormData();
            // formData.append('title', post.value.title);
            // formData.append('description', post.value.description);
            // formData.append('category', post.value.category);
            // formData.append('dateCreated', post.value.dateCreated);
            // formData.append('userId', post.value.userId);
            
            // // Si hay una imagen seleccionada, agregarla al FormData
            // if (file.value) {
            //     formData.append('file', file.value);
            // }
            // const response = await axios.post('http://localhost:3000/posts/create', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });
            // //console.log('Post created:', response.data);
            
            // // Emitir el evento con el nuevo post
            // const newPost = response.data;
            // emit('postCreated', newPost);
            // isActive.value = false; // Close dialog
            // // Limpiar el formulario
            // post.value = {
            //     title: '',
            //     description: '',
            //     category: '',
            //     dateCreated: '',
            //     userId: ''
            // };
        } catch (err) {
            console.error('Error:', err);
            // Tipar el error como AxiosError
            const errorAxios = err as AxiosError;
            if (errorAxios.response) {
                error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};
</script>

<template>
    <v-form v-model="valid" @submit.prevent="submitEnroll">
        <v-dialog v-model="isActive"  transition="dialog-bottom-transition" class="dialog-mw">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="w-100" v-bind="props" flat>Solicitar Participar</v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card>
                    <v-toolbar color="primary" class="px-6">Solicitud de Participación</v-toolbar>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12">
                                <v-alert v-if="error" type="error" dismissible>
                                    {{ error }}
                                </v-alert>
                            </v-col>
                            <!-- <v-col cols="12">
                                <v-text-field v-model="post.title" :rules="notEmptyRule" label="Titulo" required></v-text-field>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="post.description" :rules="notEmptyRule" label="Descripción" required></v-textarea>
                            </v-col>               -->
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn variant="tonal" @click="isActive.value = false" flat>Cancelar</v-btn>
                        <v-btn :disabled="!valid" color="primary" variant="tonal" @click="submitEnroll" flat>Guardar</v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>
