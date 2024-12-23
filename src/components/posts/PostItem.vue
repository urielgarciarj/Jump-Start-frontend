<script setup lang="ts">
import { ref } from 'vue';
import Comments from './Comments.vue';
import { Message2Icon } from 'vue-tabler-icons';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { router } from '@/router';
import { Icon } from "@iconify/vue";

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
    post: Object
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

const showCommentBox = ref(false);
const commentText = ref('');
const comments = ref<any[]>([]);
const loadingComments = ref(false);

const emit = defineEmits(['deletePost']);
const showConfirmation = ref(false);
const postIdToDelete = ref<string | undefined>(undefined);

const showEditForm = ref(false);
const editedTitle = ref(props.post?.title || '');
const editedDescription = ref(props.post?.description || '');
const editedCategory = ref(props.post?.category || '');
// Función para mostrar u ocultar los comentarios
const toggleCommentbox = async (postId: string) => {
    if(!postId) return;
    showCommentBox.value = !showCommentBox.value;
    if (showCommentBox.value && comments.value.length === 0) {
        await loadComments(postId);
    }
};
async function loadComments(postId: string) {
    loadingComments.value = true;
    try {
        const response = await axios.get(`http://localhost:3000/post-comments/list/by-post/${postId}`);
        comments.value = response.data || [];
    } catch (error) {
        console.error('Error al obtener los comentarios:', error);
    } finally {
        loadingComments.value = false;
    }
};
// Funcion para agregar un nuevo comentario [axios]
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
        commentText.value = '';
    } catch (err) {
        console.error('Error:', err);
    }
};
const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || '';  
};
// Función para editar el post
const editPost = () => {
    showEditForm.value = true;
    // Copiar los valores actuales del post a las variables de edición
    editedTitle.value = props.post?.title;
    editedDescription.value = props.post?.description;
    editedCategory.value = props.post?.category;
};
const savePost = async () => {
    if (props.post?.id && (editedTitle.value !== props.post.title || editedDescription.value !== props.post.description || editedCategory.value !== props.post.category)) {
        try {
            const updatedPost = {
                title: editedTitle.value,
                description: editedDescription.value,
                category: editedCategory.value
            };
            // Enviar la solicitud de actualización al servidor
            await axios.put(`http://localhost:3000/posts/update/${props.post.id}`, updatedPost);
            // Actualiza la vista del post con los nuevos datos
            props.post.title = editedTitle.value;
            props.post.description = editedDescription.value;
            props.post.category = editedCategory.value;
            showEditForm.value = false;
        } catch (err) {
            console.error('Error al actualizar el post:', err);
        }
    } else {
        showEditForm.value = false; // Si no hubo cambios, solo salimos del modo de edición
    }
};
//Funcion para manejar eliminar un post
const handleDeletePost = () => {
    postIdToDelete.value = props.post ? props.post.id : ''; 
    showConfirmation.value = true; 
};
const confirmDelete = async () => {
  if (postIdToDelete.value !== undefined) {
    try {
        await axios.delete(`http://localhost:3000/posts/delete/${postIdToDelete.value}`);
        emit('deletePost', postIdToDelete.value);
    } catch (err) {
        console.log('Error', err);
    }
    postIdToDelete.value = undefined; 
    showConfirmation.value = false; 
  }
};
// Comentario eliminado refresh
const handleDeletedComment = (deletedCommentId: string) => {
  comments.value = comments.value.filter(comment => comment.id !== deletedCommentId);
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
                <div v-if="post?.user.id === userId" class="d-block d-sm-flex align-center gap-3">
                    <!-- Edit post action-->
                    <v-btn @click.stop="editPost()" icon color="lightsuccess" size="32">
                        <Icon icon="solar:pen-linear" class="text-success" height="18" />
                        <v-tooltip activator="parent" location="bottom">Editar</v-tooltip>
                    </v-btn>
                    <!-- Delete post action-->
                    <v-btn @click.stop="handleDeletePost()" icon color="lighterror" size="32">
                        <Icon icon="solar:trash-bin-minimalistic-linear" class="text-error" height="18"/>
                        <v-tooltip activator="parent" location="bottom">Eliminar</v-tooltip>
                    </v-btn>
                </div>
            </div>
            <div class="d-flex justify-end">
                <v-chip :color="getCategoryColor(post?.category)" class="font-weight-bold d-flex justify-end" size="small" rounded="sm"> 
                    {{ post?.category }}
                </v-chip>
            </div>
            <v-card-text v-if="!showEditForm">
                <h3>{{ post?.title }} </h3>
                {{ post?.description }}
            </v-card-text>
            <!-- Formulario de edición -->
            <div v-if="showEditForm">
                <v-card-text v-if="showEditForm">
                    <v-text-field v-model="editedTitle" label="Título" outlined dense autofocus/>
                    <v-textarea v-model="editedDescription" label="Descripción" outlined dense/>
                    <v-select v-model="editedCategory" :items="Object.keys(categoryColors)" label="Categoría" outlined dense/>
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="showEditForm = false" variant="tonal" size="small">Cancelar</v-btn>
                    <v-btn @click="savePost" variant="tonal" size="small" color="primary">Guardar</v-btn>
                </v-card-actions>
            </div>
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
                 <v-btn v-if="post?.id" @click="toggleCommentbox(post?.id)" color="primary" outlined>
                     <Message2Icon size="20" stroke-width="1.5" class="mr-2" />
                     {{ showCommentBox ? 'Ocultar Comentarios' : 'Cargar Comentarios' }}
                 </v-btn>
             </div>
            <div v-if="showCommentBox" class="pa-5 pt-0">
                <br/>
                <div v-if="comments.length > 0" v-for="comment in comments">
                    <Comments v-if="comment" :comment="comment" @deleteComment="handleDeletedComment"/>
                </div>
                <v-divider />
                <div class="d-block d-sm-flex gap-3 align-center mb-4 px-4 pt-4">
                    <v-avatar size="40" color="secondary" variant="flat" class="text-h5 font-weight-medium"> D </v-avatar>
                    <v-text-field variant="outlined" color="primary" v-model="commentText" placeholder="Escribe tu comentario" hide-details></v-text-field>
                    <v-btn
                        color="primary"
                        variant="flat"
                        :disabled="commentText === ''"
                        class="mt-3 mt-sm-0"
                        @click="addComment(post?.id, commentText)"
                    >
                        Enviar
                    </v-btn>
                </div>
            </div>
        </v-card-item>
    </v-card>
    
    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Publicación</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar esta publicación?</h5>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="tonal" class="px-4" @click="showConfirmation = false">Cancelar</v-btn>
                <v-btn color="error" class="px-4" variant="tonal" @click="confirmDelete">Si, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
