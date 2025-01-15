<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { defineProps, defineEmits } from 'vue';

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
    <v-card-text>
      <v-text-field v-model="editedTitle" label="Título" :rules="notEmptyRule" outlined dense autofocus required />
      <v-textarea v-model="editedDescription" label="Descripción" :rules="notEmptyRule" outlined dense required />
      <v-select v-model="editedCategory"
        :items="categories" label="Categoría" :rules="notEmptyRule" outlined dense required />
      <v-file-input @change="handleFileChange" accept="image/*" label="Adjuntar nueva imagen" hide-details variant="outlined"> </v-file-input>
    </v-card-text>
    <v-card-actions>
      <v-btn @click="cancelEdit" variant="tonal" size="small">Cancelar</v-btn>
      <v-btn @click="savePost" :disabled="!valid" variant="tonal" size="small" color="primary">Guardar</v-btn>
    </v-card-actions>
  </v-form>
</template>
