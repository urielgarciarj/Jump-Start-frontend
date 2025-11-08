<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import axios from 'axios';
import { Icon } from "@iconify/vue";
import { CircleIcon } from 'vue-tabler-icons';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
    comment: Object
});

// Redirigir el emit al componente principal
const emit = defineEmits(['deleteComment']);
const showConfirmation = ref(false);
const commentIdToDelete = ref<string | undefined>(undefined);

// Estado para controlar si el comentario está en modo de edición
const isEditing = ref(false);
const editedText = ref(props.comment?.text || '');
const valid = ref(false);
const notEmptyRule = [
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];
// Función para editar el comentario
const editComment = () => {
    isEditing.value = true; // Cambiar al modo de edición
};
// Función para guardar el comentario editado
const saveComment = async () => {
    if (props.comment?.id && editedText.value !== props.comment.text && valid.value) {
        try {
            await axios.put(`http://localhost:3000/post-comments/update/${props.comment.id}`, {
                text: editedText.value,
            });
            // Actualizar el texto del comentario en el componente
            props.comment.text = editedText.value;
            isEditing.value = false; // Salir del modo de edición
        } catch (err) {
            console.error('Error al guardar el comentario', err);
        }
    } else {
        isEditing.value = false; // Si no hubo cambios, solo salimos del modo de edición
    }
};
const handleCommentDeleted = () => {
    if (props.comment?.id) {
        commentIdToDelete.value = props.comment.id;
        showConfirmation.value = true;
    } 
};
// Function to confirm deletion
const confirmDelete = async () => {
  if (commentIdToDelete.value !== undefined) {
    try {
        await axios.delete(`http://localhost:3000/post-comments/remove/${commentIdToDelete.value}`);
        emit('deleteComment', commentIdToDelete.value);
    } catch (err) {
        console.log('Error', err);
    }
    commentIdToDelete.value = undefined; 
    showConfirmation.value = false; 
  }
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
    <v-card variant="outlined" class="comment-card mb-3" rounded="lg">
        <v-card-item class="pa-4">
            <div class="comment-header mb-3">
                <div class="d-flex gap-3 align-center">
                    <v-avatar size="40" class="comment-avatar"> 
                        <template v-if="comment?.user.profile?.picture">
                            <img :src="comment?.user.profile?.picture" alt="icon" height="40" />
                        </template>
                        <template v-else>
                            <div class="avatar-initials">
                                {{ comment?.user.name.charAt(0).toUpperCase() }}{{ comment?.user.lastName.charAt(0).toUpperCase() }}
                            </div>
                        </template>
                    </v-avatar>
                    <div class="comment-author-info flex-grow-1">
                        <div class="d-flex align-center gap-2 flex-wrap">
                            <h6 class="text-body-1 font-weight-bold mb-0">{{ comment?.user.name }} {{ comment?.user.lastName }}</h6>
                            <span class="comment-date">
                                <CircleIcon size="6" fill="inherit" class="date-dot mr-1" />
                                <span class="text-caption text-medium-emphasis">{{ formatDateTime(comment?.dateCreated) }}</span>
                            </span>
                        </div>
                    </div>
                    <div v-if="comment?.user.id === userId" class="comment-actions">
                        <v-btn 
                            @click="editComment()" 
                            icon 
                            variant="text" 
                            size="small"
                            class="action-btn edit-btn"
                        >
                            <Icon icon="solar:pen-linear" height="16" />
                            <v-tooltip activator="parent" location="bottom">Editar</v-tooltip>
                        </v-btn>
                        <v-btn 
                            @click.stop="handleCommentDeleted()" 
                            icon 
                            variant="text" 
                            size="small"
                            class="action-btn delete-btn"
                        >
                            <Icon icon="solar:trash-bin-minimalistic-linear" height="16"/>
                            <v-tooltip activator="parent" location="bottom">Eliminar</v-tooltip>
                        </v-btn>
                    </div>
                </div>
            </div>
            
            <div v-if="isEditing" class="edit-comment-form">
                <v-form v-model="valid" @submit.prevent="saveComment">
                    <v-textarea 
                        v-model="editedText" 
                        :rules="notEmptyRule" 
                        rows="3"
                        variant="outlined"
                        rounded="lg"
                        color="primary"
                        hide-details="auto"
                        class="mb-3"
                        autofocus
                    />
                    <div class="d-flex justify-end gap-2">
                        <v-btn 
                            @click="isEditing = false" 
                            variant="tonal" 
                            rounded="lg"
                            size="small"
                        >
                            Cancelar
                        </v-btn>
                        <v-btn 
                            @click="saveComment" 
                            :disabled="!valid" 
                            variant="flat" 
                            color="primary" 
                            rounded="lg"
                            size="small"
                            class="save-comment-btn"
                        >
                            <Icon icon="mdi:check" height="16" class="mr-1" />
                            Guardar
                        </v-btn>
                    </div>
                </v-form>
            </div>
            <div v-else class="comment-content">
                <p class="text-body-2 mb-0">{{ comment?.text }}</p>
            </div>
        </v-card-item>
    </v-card>
    
    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmation" max-width="500px" persistent>
        <v-card rounded="lg">
            <v-card-title class="pa-4 bg-error text-white">
                <Icon icon="mdi:alert-circle" height="24" class="mr-2" />
                Eliminar Comentario
            </v-card-title>
            <v-card-text class="pa-4">
                <p class="text-body-1 mb-0">¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.</p>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="tonal" @click="showConfirmation = false" rounded="lg">Cancelar</v-btn>
                <v-btn color="error" variant="flat" @click="confirmDelete" rounded="lg">Sí, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.comment-card {
    border-radius: 12px !important;
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.comment-card:hover {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transform: translateX(4px);
}

.comment-header {
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.comment-avatar {
    border: 2px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
}

.comment-avatar:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
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
    font-size: 0.875rem;
}

.comment-author-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.comment-date {
    display: flex;
    align-items: center;
    gap: 4px;
}

.date-dot {
    color: rgb(148, 163, 184);
}

.comment-actions {
    display: flex;
    gap: 4px;
}

.action-btn {
    transition: all 0.2s ease;
    border-radius: 6px;
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

.comment-content {
    padding: 8px 0;
    color: #475569;
    line-height: 1.6;
    white-space: pre-wrap;
}

.edit-comment-form {
    padding: 12px;
    background: rgba(99, 102, 241, 0.02);
    border-radius: 8px;
    border: 1px dashed rgba(99, 102, 241, 0.3);
}

.save-comment-btn {
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
}

.save-comment-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

@media (max-width: 600px) {
    .comment-card {
        border-radius: 10px !important;
    }
    
    .comment-avatar {
        size: 36px;
    }
}
</style>
