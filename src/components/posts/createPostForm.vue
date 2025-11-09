<script setup lang="ts">
import { ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';

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
        <v-dialog v-model="isActive" max-width="700" persistent>
            <template v-slot:activator="{ props }">
                <v-btn 
                    color="primary" 
                    class="w-100 create-post-btn" 
                    v-bind="props" 
                    variant="flat"
                    rounded="lg"
                    size="large"
                >
                    <Icon icon="mdi:plus-circle-outline" height="20" class="mr-2" />
                    Nueva publicación
                </v-btn>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card rounded="lg" class="create-post-dialog">
                    <v-card-title class="pa-6 bg-primary text-white create-post-header">
                        <div class="d-flex align-center">
                            <div class="header-icon-wrapper mr-3">
                                <Icon icon="mdi:post-outline" height="24" />
                            </div>
                            <span class="text-h6 font-weight-bold">Nueva Publicación</span>
                        </div>
                    </v-card-title>
                    
                    <v-card-text class="pa-6">
                        <v-row>
                            <v-col cols="12">
                                <v-alert 
                                    v-if="error" 
                                    type="error" 
                                    variant="tonal"
                                    dismissible
                                    rounded="lg"
                                    class="mb-4"
                                >
                                    {{ error }}
                                </v-alert>
                            </v-col>
                            
                            <v-col cols="12">
                                <v-label class="mb-2 font-weight-medium text-body-1">Título</v-label>
                                <v-text-field 
                                    v-model="post.title" 
                                    :rules="notEmptyRule" 
                                    label="Escribe un título atractivo..." 
                                    required
                                    variant="outlined"
                                    rounded="lg"
                                    color="primary"
                                    hide-details="auto"
                                    class="mb-2"
                                ></v-text-field>
                            </v-col>
                            
                            <v-col cols="12">
                                <v-label class="mb-2 font-weight-medium text-body-1">Descripción</v-label>
                                <v-textarea 
                                    v-model="post.description" 
                                    :rules="notEmptyRule" 
                                    label="Comparte tus ideas con la comunidad..." 
                                    required
                                    variant="outlined"
                                    rounded="lg"
                                    color="primary"
                                    rows="5"
                                    hide-details="auto"
                                    class="mb-2"
                                ></v-textarea>
                            </v-col>
                            
                            <v-col cols="12">
                                <v-label class="mb-2 font-weight-medium text-body-1">Categoría</v-label>
                                <v-select 
                                    v-model="post.category" 
                                    :rules="notEmptyRule"
                                    :items="categories"
                                    label="Selecciona una categoría"
                                    required
                                    variant="outlined"
                                    rounded="lg"
                                    color="primary"
                                    hide-details="auto"
                                    class="mb-2"
                                ></v-select>
                            </v-col>
                            
                            <v-col cols="12">
                                <v-label class="mb-2 font-weight-medium text-body-1">Imagen (Opcional)</v-label>
                                <v-file-input 
                                    @change="handleFileChange" 
                                    accept="image/*" 
                                    label="Selecciona una imagen" 
                                    hide-details
                                    variant="outlined"
                                    rounded="lg"
                                    color="primary"
                                    prepend-icon="mdi:image-outline"
                                ></v-file-input>
                                <div class="text-caption text-medium-emphasis mt-2">
                                    Formatos soportados: JPG, PNG, GIF (máx. 5MB)
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    
                    <v-card-actions class="pa-6 pt-0">
                        <v-spacer></v-spacer>
                        <v-btn 
                            variant="tonal" 
                            @click="isActive.value = false" 
                            rounded="lg"
                            class="mr-2"
                        >
                            Cancelar
                        </v-btn>
                        <v-btn 
                            :disabled="!valid" 
                            color="primary" 
                            variant="flat" 
                            @click="createPost" 
                            rounded="lg"
                            class="create-btn"
                        >
                            <Icon icon="mdi:check" height="18" class="mr-2" />
                            Publicar
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    </v-form>
</template>

<style scoped>
.create-post-btn {
    font-weight: 600;
    text-transform: none;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
}

.create-post-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.create-post-dialog {
    overflow: hidden;
}

.create-post-header {
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%) !important;
}

.header-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.create-btn {
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
}

.create-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>
