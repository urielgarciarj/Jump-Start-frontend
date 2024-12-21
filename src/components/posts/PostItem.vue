<script setup lang="ts">
import { ref } from 'vue';
import Comments from './Comments.vue';
import { Message2Icon } from 'vue-tabler-icons';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
    post: Object || Array
});

// Mapa de colores para cada categoría
const categoryColors = {
  "Investigación y Ciencia": "primary",
  "Recursos Académicos": "secondary",
  "Consejos de Estudio": "success",
  "Tecnología y Herramientas de Estudio": "error",
  "Vida Universitaria": "warning",
  "Intereses y Hobbies": "info",
  "Desarrollo Personal y Profesional": "#FFBDF5",
  "Innovación y Emprendimiento": "#F0A048",
  "Cultura y Diversidad": "#4FAA69"
};

const showCommentBox = ref(false);  // Inicia como verdadero para cargar los comentarios
const searchValue = ref('');
const comments = ref<any[]>([]);
const loadingComments = ref(false);

// Función para mostrar u ocultar los comentarios
const toggleCommentbox = (postId: string) => {
  showCommentBox.value = !showCommentBox.value;
  if (!showCommentBox.value && comments.value.length === 0) {
    loadComments(postId);
  }
};

async function loadComments(postId: string) {
    loadingComments.value = true;
    try {
        const response = await axios.get(`http://localhost:3000/post-comments/list/by-post/${postId}`);
        comments.value = response.data;
    } catch (error) {
        console.error('Error al obtener los comentarios:', error);
    } finally {
        loadingComments.value = false;
    }
};

const addComment = async (postid: any, comment: any) => {
    try {
        const newComment: any = {
            postId: postid,
            userId: userId,
            dateCreated: new Date().toISOString(),
            text: comment
        }
        const response = await axios.post('http://localhost:3000/post-comments/create', newComment);
        //console.log('comment created:', response.data);
        const comment_new = response.data;
        comments.value.push(comment_new);
        searchValue.value = '';
    } catch (err) {
        console.error('Error:', err);
    }
};

const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || '';  
};

// Función para formatear fecha, hora y minutos
const formatDateTime = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    weekday: 'long',   // Día de la semana (opcional)
    day: 'numeric',    // Día
    month: 'long',     // Mes
    year: 'numeric',   // Año
    hour: '2-digit',   // Hora (en formato 2 dígitos)
    minute: '2-digit', // Minutos (en formato 2 dígitos)
  });
};
</script>

<template>
    <v-card variant="outlined">
        <v-card-item>
            <div class="d-flex gap-3 align-center">
                <v-avatar size="40" color="warning" variant="flat" class="text-h5 font-weight-medium"> D </v-avatar>
                <div class="d-block d-sm-flex align-center gap-3">
                    <h6 class="text-h6">{{ post?.user.name }} {{ post?.user.lastName }}</h6>
                    <span class="text-subtitle-2 opacity-50">
                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                        {{ formatDateTime(post?.dateCreated) }}
                    </span>
                </div>
            </div>
            <div class="d-flex justify-end">
                <v-chip :color="getCategoryColor(post?.category)" class="font-weight-bold d-flex justify-end" size="small" rounded="sm"> 
                    {{ post?.category }}
                </v-chip>
            </div>
            <v-card-text>
                <h3>{{ post?.title }} </h3>
                {{ post?.description }}
            </v-card-text>
                
            <!---If Images-->
            <!-- <v-row v-if="post?.data.images">
                <v-col :md="photo.featured ? '12' : '6'" v-for="photo in post?.data.images">
                    <v-avatar class="rounded-md w-100" size="360">
                        <img :src="photo.img" alt="photo" />
                    </v-avatar>
                </v-col>
            </v-row> -->
            
            <!--- Comments count-->
            <!-- <div class="my-4 mt-5 d-flex align-center">
                <v-tooltip text="Comment">
                    <template v-slot:activator="{ props }">
                        <div class="d-flex gap-2 me-4 align-center">
                            <v-btn icon v-bind="props" color="secondary" variant="flat" size="x-small" @click="toggleCommentbox">
                                <Message2Icon size="16" />
                            </v-btn>
                            <span class="text-body-1 font-weight-semibold">{{ post?.data.comments ? post?.data.comments.length : 0 }}</span>
                        </div>
                    </template>
                </v-tooltip>
            </div> -->
        </v-card-item>
        
        <v-card-item>
            <!-- Botón para cargar/ocultar los comentarios -->
             <div  class="d-flex gap-3 justify-end">
                 <v-btn @click="toggleCommentbox(post?.id)" color="primary" outlined>
                     <Message2Icon size="20" stroke-width="1.5" class="mr-2" />
                     {{ showCommentBox ? 'Ocultar Comentarios' : 'Cargar Comentarios' }}
                 </v-btn>
             </div>
            <div v-if="showCommentBox" class="pa-5 pt-0">
                <br/>
                <div v-for="comment in comments">
                    <Comments :comments="comment" :postId="post?.id" />
                </div>
                <v-divider />
                <div class="d-block d-sm-flex gap-3 align-center mb-4 px-4 pt-4">
                    <v-avatar size="40" color="secondary" variant="flat" class="text-h5 font-weight-medium"> D </v-avatar>
                    <v-text-field variant="outlined" color="primary" v-model="searchValue" placeholder="Escribe tu comentario" hide-details></v-text-field>
                    <v-btn
                        color="primary"
                        variant="flat"
                        :disabled="searchValue === ''"
                        class="mt-3 mt-sm-0"
                        @click="addComment(post?.id, searchValue)"
                    >
                        Enviar
                    </v-btn>
                </div>
            </div>
        </v-card-item>
    </v-card>
</template>
