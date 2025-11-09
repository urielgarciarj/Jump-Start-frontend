<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { defineProps, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  post: Object, // Recibe el post que se va a editar
});
const categories = ref([
    "Investigación y Ciencia", "Recursos Académicos", "Consejos de Estudio", "Tecnología y Herramientas de Estudio",
    "Vida Universitaria", "Desarrollo Personal y Profesional", "Intereses y Hobbies", "Innovación y Emprendimiento", "Cultura y Diversidad"
]);

const emit = defineEmits(['updatePost', 'cancelEdit']); // Emitir eventos para actualizar o cancelar la edición

const editedTitle = ref(props.post?.title || '');
const editedDescription = ref(props.post?.description || '');
const editedCategory = ref(props.post?.category || '');
const file = ref<File | null>(null);

const valid = ref(false);

const notEmptyRule = [
  (value: string) => !!value || 'Este campo es obligatorio.'
];

// Función para guardar los cambios
const savePost = async () => {
  if (props.post?.id && valid.value) {
    try {
      const updatedPost = {
        title: editedTitle.value,
        description: editedDescription.value,
        category: editedCategory.value,
      };
      // Crear un FormData para enviar los datos y el archivo
      const formData = new FormData();
      formData.append('title', editedTitle.value);
      formData.append('description', editedDescription.value);
      formData.append('category', editedCategory.value);

      // Si hay un archivo (imagen) seleccionado, añadirlo al FormData
      if (file.value) {
        formData.append('file', file.value);
      }

      // Solicitud PUT para actualizar el post en el servidor
      const response = await axios.put(`http://localhost:3000/posts/update/${props.post.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Asegúrate de que el tipo de contenido sea multipart
        },
      });
      // Emitir evento para actualizar el post en el componente principal
      emit('updatePost', {...props.post,...response.data,});
    } catch (err) {
      console.error('Error al actualizar el post:', err);
    }
  }
};

// Función para cancelar la edición
const cancelEdit = () => {
  emit('cancelEdit');
};

const handleFileChange = (event: Event) => {
  const inputEvent = event.target as HTMLInputElement;
  if (inputEvent.files && inputEvent.files.length > 0) {
    file.value = inputEvent.files[0]; // Guardamos el archivo seleccionado
  }
};
</script>

<template>
  <v-form v-model="valid" @submit.prevent="savePost">
    <div class="edit-form-content">
      <div class="edit-form-header mb-4">
        <Icon icon="mdi:pencil-outline" height="20" class="mr-2" />
        <span class="text-subtitle-1 font-weight-bold">Editar Publicación</span>
      </div>
      
      <v-text-field 
        v-model="editedTitle" 
        label="Título" 
        :rules="notEmptyRule" 
        variant="outlined" 
        rounded="lg"
        color="primary"
        hide-details="auto"
        class="mb-3"
        autofocus 
        required 
      />
      
      <v-textarea 
        v-model="editedDescription" 
        label="Descripción" 
        :rules="notEmptyRule" 
        variant="outlined" 
        rounded="lg"
        color="primary"
        rows="5"
        hide-details="auto"
        class="mb-3"
        required 
      />
      
      <v-select 
        v-model="editedCategory"
        :items="categories" 
        label="Categoría" 
        :rules="notEmptyRule" 
        variant="outlined" 
        rounded="lg"
        color="primary"
        hide-details="auto"
        class="mb-3"
        required 
      />
      
      <v-file-input 
        @change="handleFileChange" 
        accept="image/*" 
        label="Adjuntar nueva imagen (opcional)" 
        hide-details
        variant="outlined"
        rounded="lg"
        color="primary"
        prepend-icon="mdi:image-outline"
        class="mb-3"
      />
      
      <div class="edit-form-actions mt-4">
        <v-btn 
          @click="cancelEdit" 
          variant="tonal" 
          rounded="lg"
          class="mr-2"
        >
          Cancelar
        </v-btn>
        <v-btn 
          @click="savePost" 
          :disabled="!valid" 
          variant="flat" 
          color="primary" 
          rounded="lg"
          class="save-btn"
        >
          <Icon icon="mdi:check" height="18" class="mr-2" />
          Guardar Cambios
        </v-btn>
      </div>
    </div>
  </v-form>
</template>

<style scoped>
.edit-form-content {
    padding: 8px;
}

.edit-form-header {
    display: flex;
    align-items: center;
    padding: 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    border-radius: 12px;
    border-left: 3px solid rgb(99, 102, 241);
    color: rgb(99, 102, 241);
}

.edit-form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.save-btn {
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>
