<script setup lang="ts">
import { ref } from 'vue';
import Comments from './Comments.vue';
import EditPostForm from './updatePostForm.vue';
import { Message2Icon, CircleIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';
import { Icon } from "@iconify/vue";
import { RouterLink } from 'vue-router';
import axios from 'axios';

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
};
// Función para manejar la actualización del post
const handleUpdatePost = (updatedPost: { title: any; description: any; category: any; mediaUrl: any; }) => {
    //console.log('handleUpdatePost', updatedPost)
    if (props.post) {
        props.post.title = updatedPost.title;
        props.post.description = updatedPost.description;
        props.post.category = updatedPost.category;
        props.post.mediaUrl = updatedPost.mediaUrl;
    }
  showEditForm.value = false;
};
// Función para cancelar la edición
const cancelEdit = () => {
  showEditForm.value = false;
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

<style scoped>
.post-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
}

.post-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.post-header {
    padding: 12px 24px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: flex-end;
}

.category-chip {
    font-weight: 600;
    text-transform: capitalize;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-author-section {
    margin-bottom: 16px;
}

.post-avatar {
    border: 3px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.post-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.avatar-initials {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.author-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.author-name {
    font-size: 1rem;
    font-weight: 600;
    color: rgb(99, 102, 241);
    transition: all 0.2s ease;
}

.author-name:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.post-date {
    display: flex;
    align-items: center;
    gap: 4px;
}

.date-dot {
    color: rgb(148, 163, 184);
}

.post-actions {
    display: flex;
    gap: 4px;
}

.action-btn {
    transition: all 0.2s ease;
    border-radius: 8px;
}

.action-btn:hover {
    background-color: rgba(99, 102, 241, 0.1);
    transform: scale(1.1);
}

.edit-btn:hover {
    color: rgb(99, 102, 241) !important;
}

.delete-btn:hover {
    color: rgb(239, 68, 68) !important;
}

.post-content {
    margin-top: 16px;
}

.post-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.3;
    letter-spacing: -0.02em;
}

.post-description {
    color: #64748b;
    line-height: 1.6;
    white-space: pre-wrap;
}

.post-image-wrapper {
    border-radius: 12px;
    overflow: hidden;
    background: rgba(99, 102, 241, 0.02);
    padding: 8px;
}

.post-image {
    width: 100%;
    max-width: 100%;
    max-height: 500px;
    object-fit: contain;
    border-radius: 8px;
    transition: transform 0.3s ease;
}

.post-image:hover {
    transform: scale(1.02);
}

.comments-toggle-btn {
    text-transform: none;
    font-weight: 500;
    transition: all 0.2s ease;
}

.comments-toggle-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
}

.comments-count {
    font-weight: 600;
    opacity: 0.8;
}

.comments-section {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.new-comment-form {
    padding: 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.comment-avatar {
    flex-shrink: 0;
    border: 2px solid rgba(99, 102, 241, 0.2);
}

.comment-input {
    flex: 1;
}

.send-comment-btn {
    min-width: 48px;
    transition: all 0.2s ease;
}

.send-comment-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.edit-form-wrapper {
    padding: 16px;
    background: rgba(99, 102, 241, 0.02);
    border-radius: 12px;
    border: 1px dashed rgba(99, 102, 241, 0.3);
}

@media (max-width: 600px) {
    .post-card {
        border-radius: 12px !important;
    }
    
    .post-title {
        font-size: 1.25rem;
    }
    
    .post-avatar {
        size: 40px;
    }
    
    .new-comment-form {
        padding: 8px;
    }
}
</style>

<template>
    <v-card variant="outlined" class="post-card" rounded="lg">
        <div class="post-header">
            <v-chip 
                :color="getCategoryColor(post?.category)" 
                class="category-chip font-weight-bold" 
                size="small" 
                rounded="lg"
            > 
                {{ post?.category }}
            </v-chip>
        </div>
        
        <v-card-item class="pa-6">
            <div class="post-author-section">
                <div class="d-flex gap-3 align-center mb-4">
                    <v-avatar size="48" class="post-avatar"> 
                        <template v-if="post?.user.profile?.picture">
                            <img :src="post?.user.profile?.picture" alt="icon" height="48" />
                        </template>
                        <template v-else>
                            <div class="avatar-initials">
                                {{ post?.user.name.charAt(0).toUpperCase() }}{{ post?.user.lastName.charAt(0).toUpperCase() }}
                            </div>
                        </template>
                    </v-avatar>
                    <div class="author-info flex-grow-1">
                        <RouterLink 
                            class="author-name text-decoration-none" 
                            :to="`/profile/${post?.user.id}`"
                        >
                            {{ post?.user.name }} {{ post?.user.lastName }}
                        </RouterLink>
                        <div class="post-date">
                            <CircleIcon size="8" fill="inherit" class="date-dot mr-1" />
                            <span class="text-caption text-medium-emphasis">{{ formatDateTime(post?.dateCreated) }}</span>
                        </div>
                    </div>
                    <div v-if="post?.user.id === userId" class="post-actions">
                        <v-btn 
                            @click.stop="editPost()" 
                            icon 
                            variant="text" 
                            size="small"
                            class="action-btn edit-btn"
                        >
                            <Icon icon="solar:pen-linear" height="18" />
                            <v-tooltip activator="parent" location="bottom">Editar</v-tooltip>
                        </v-btn>
                        <v-btn 
                            @click.stop="handleDeletePost()" 
                            icon 
                            variant="text" 
                            size="small"
                            class="action-btn delete-btn"
                        >
                            <Icon icon="solar:trash-bin-minimalistic-linear" height="18"/>
                            <v-tooltip activator="parent" location="bottom">Eliminar</v-tooltip>
                        </v-btn>
                    </div>
                </div>
            </div>
            
            <div v-if="!showEditForm" class="post-content">
                <h3 class="post-title mb-3">{{ post?.title }}</h3>
                <p class="post-description text-body-1">{{ post?.description }}</p>
            </div>
            
            <!-- Formulario de edición -->
            <div v-if="showEditForm" class="edit-form-wrapper">
                <EditPostForm
                    :post="post"
                    @updatePost="handleUpdatePost"
                    @cancelEdit="cancelEdit"
                />
            </div>
            
            <!-- Imagen del post -->
            <div v-if="post?.mediaUrl" class="post-image-wrapper mt-4">
                <img :src="post?.mediaUrl" class="post-image" alt="Post image"/>
            </div>
        </v-card-item>
        
        <v-card-item class="pa-6 pt-0">
            <v-divider class="mb-4"></v-divider>
            
            <!-- Botón para cargar/ocultar los comentarios -->
            <div class="d-flex justify-end mb-4">
                <v-btn 
                    v-if="post?.id" 
                    @click="toggleCommentbox(post?.id)" 
                    color="primary" 
                    variant="outlined"
                    class="comments-toggle-btn"
                    rounded="lg"
                >
                    <Message2Icon size="18" stroke-width="1.5" class="mr-2" />
                    {{ showCommentBox ? 'Ocultar Comentarios' : 'Ver Comentarios' }}
                    <span v-if="comments.length > 0" class="ml-2 comments-count">({{ comments.length }})</span>
                </v-btn>
            </div>
            
            <!-- Sección de comentarios -->
            <div v-if="showCommentBox" class="comments-section">
                <v-skeleton-loader
                    v-if="loadingComments"
                    type="list-item-avatar-two-line"
                    class="mb-4"
                ></v-skeleton-loader>
                
                <div v-else>
                    <div v-if="comments.length > 0" class="comments-list mb-4">
                        <Comments 
                            v-for="comment in comments" 
                            :key="comment.id"
                            v-if="comment" 
                            :comment="comment" 
                            @deleteComment="handleDeletedComment"
                        />
                    </div>
                    
                    <v-divider class="mb-4"></v-divider>
                    
                    <!-- Formulario de nuevo comentario -->
                    <div class="new-comment-form">
                        <div class="d-flex gap-2 align-center">
                            <v-avatar size="36" class="comment-avatar">
                                <Icon icon="mdi:account-circle" height="36" />
                            </v-avatar>
                            <v-text-field 
                                variant="outlined" 
                                color="primary" 
                                v-model="commentText" 
                                placeholder="Escribe tu comentario..." 
                                hide-details
                                rounded="lg"
                                class="comment-input"
                                @keyup.enter="commentText && addComment(post?.id, commentText)"
                            ></v-text-field>
                            <v-btn
                                color="primary"
                                variant="flat"
                                :disabled="commentText === ''"
                                class="send-comment-btn"
                                rounded="lg"
                                @click="addComment(post?.id, commentText)"
                            >
                                <Icon icon="mdi:send" height="18" />
                            </v-btn>
                        </div>
                    </div>
                </div>
            </div>
        </v-card-item>
    </v-card>
    
    <!-- Confirmation Dialog Delete Post-->
    <v-dialog v-model="showConfirmation" max-width="500px" persistent>
        <v-card rounded="lg">
            <v-card-title class="pa-4 bg-error text-white">
                <Icon icon="mdi:alert-circle" height="24" class="mr-2" />
                Eliminar Publicación
            </v-card-title>
            <v-card-text class="pa-4">
                <p class="text-body-1 mb-0">¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.</p>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="showConfirmation = false" rounded="lg">Cancelar</v-btn>
                <v-btn color="error" variant="flat" @click="confirmDelete" rounded="lg">Sí, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
