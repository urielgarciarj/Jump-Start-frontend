<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import axios from 'axios';
import { Icon } from "@iconify/vue";

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
    comment: Object
});

// Redirigir el emit al componente principal
const emit = defineEmits(['deleteComment']);
const showConfirmation = ref(false);
const commentIdToDelete = ref<string | undefined>(undefined);

// Función para editar el comentario
const editComment = () => {
    console.log('Editando el comentario con ID:');
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
    <v-card variant="flat" class="mb-3 pa-5 bg-light">
        <div class="d-flex gap-3 align-center">
            <v-avatar size="40" color="success" variant="flat" class="text-h5 font-weight-medium"> D </v-avatar>
            <div class="d-block d-sm-flex align-center gap-3">
                <h6 class="text-h6">{{ comment?.user.name }} {{ comment?.user.lastName }}</h6>
                <span class="text-subtitle-2 opacity-50">
                    <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                    {{ formatDateTime(comment?.dateCreated) }}
                </span>
                <div v-if="comment?.user.id === userId" class="d-flex justify-end gap-2">
                    <!-- Edit post -->
                    <v-btn icon color="lightsuccess" size="32">
                        <Icon icon="solar:pen-linear" class="text-success" height="18" />
                        <v-tooltip activator="parent" location="bottom">Editar</v-tooltip>
                    </v-btn>
                    <!-- Delete post -->
                    <v-btn @click.stop="handleCommentDeleted()" icon color="lighterror" size="32">
                        <Icon icon="solar:trash-bin-minimalistic-linear" class="text-error" height="18"/>
                        <v-tooltip activator="parent" location="bottom">Eliminar</v-tooltip>
                    </v-btn>
                </div>
            </div>
        </div>
        <div class="py-3 text-body-1">
            {{ comment?.text }}
        </div>
    </v-card>
    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Comentario</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar este comentario?</h5>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="tonal" class="px-4" @click="showConfirmation = false">Cancelar</v-btn>
                <v-btn color="primary" class="px-4" variant="tonal" @click="confirmDelete">Si, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style lang="scss" scoped>
.border-light {
    border: 1px solid rgb(var(--v-theme-grey100));
}
</style>
