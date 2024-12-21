<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { Icon } from "@iconify/vue";

// Definir las propiedades que se recibirán desde el componente principal
const props = defineProps({
    postId: String
});

// Definir el evento para emitir
const emit = defineEmits(['deletePost']);

// Acciones
const router = useRouter();
const showConfirmation = ref(false);
const postIdToDelete = ref<string | undefined>(undefined); 

// Función para editar el post
const editPost = (postId: string) => {
    console.log('Editando el post con ID:', postId);
    // Redirigir al formulario de edición, ejemplo
    router.push(`/edit-post/${postId}`);
};

const handleDeletePost = () => {
    postIdToDelete.value = props.postId; 
    showConfirmation.value = true; 
};
// Function to confirm deletion
const confirmDelete = async () => {
  if (postIdToDelete.value !== undefined) {
    try {
        const response = await axios.delete(`http://localhost:3000/posts/delete/${postIdToDelete.value}`);
        console.log('comment deleted:', response.data);
        emit('deletePost', postIdToDelete.value);
    } catch (err) {

    }
    postIdToDelete.value = undefined; 
    showConfirmation.value = false; 
  }
};
</script>


<template>
    <div class="d-flex justify-end gap-2">
        <!-- Edit post -->
        <RouterLink to="">
            <v-avatar color="lightsuccess" size="32">
            <Icon
                icon="solar:pen-linear"
                class="text-success"
                height="18"
            />
            </v-avatar>
            <v-tooltip activator="parent" location="bottom"
            >Editar</v-tooltip
            >
        </RouterLink>
        <!-- Delete post -->
        <RouterLink to=""
            @click.stop="handleDeletePost()"
            class="cursor-pointer"
        >
            <v-avatar color="lighterror" size="32">
            <Icon
                icon="solar:trash-bin-minimalistic-linear"
                class="text-error"
                height="18"
            />
            </v-avatar>
            <v-tooltip activator="parent" location="bottom"
            >Eliminar</v-tooltip
            >
        </RouterLink>
    </div>
    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Publicación</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar esta publicación?</h5>
            </v-card-text>
            <v-card-actions>
                <v-btn
                color="primary"
                class="px-4"
                variant="tonal"
                @click="confirmDelete"
                >Si, Eliminar</v-btn
                >
                <v-btn
                color="error"
                variant="tonal"
                class="px-4"
                @click="showConfirmation = false"
                >Cancelar</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
  
  