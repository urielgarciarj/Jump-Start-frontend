<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
  project: Number, // ID Proyecto solicitado
});
const currUser = ref<any>(undefined);
const enrollID = ref<any>(undefined); // save enroll ID if exists
const emit = defineEmits<{
    (e: 'enrollSaved', success: boolean): void;
    (e: 'enrollDeleted', success: boolean): void;
}>();

const enroll = ref({
    name: '',
    comments: '',
    status: '',
    dateCreated: new Date().toISOString(),
    userId: userId
});
const isActive = ref(false);
const error = ref<string | null>(null);
const valid = ref(false);
const hasSubmitted = ref(false);
const showConfirmation = ref(false);
const notEmptyRule = [ // Reglas de validación
  (value: string) => !!value || 'Es obligatorio llenar este campo.'
];

// usamos watch en lugar de onMounted para esperar los props
watch(() => props.project, async (project_id) => {
  try {
    const response = await axios.get(`http://localhost:3000/enrolls/find-by/user-project/${userId}/${project_id}`);
    console.log('response', response)
    if (response.data) { 
        hasSubmitted.value = true;
        enroll.value = response.data;
        enrollID.value = response.data.id; // Saves the ID of the enroll
    }
    else {
        hasSubmitted.value = false;
        const userResponse = await axios.get(`http://localhost:3000/users/user/${userId}`);
        currUser.value = userResponse.data;
        if (currUser.value) {
            enroll.value.name = `${currUser.value.name} ${currUser.value.lastName}`.toUpperCase();
        }
    }
  } catch (err) {
    console.error('Error al obtener los posts:', err);
    const errorAxios = err as AxiosError;
    if (errorAxios.response) {
        error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
});

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

// Formatting Functions
const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
    'aceptado': 'success',
    'rechazado': 'error'
  };

  return statusColors[status] || '#9AA6B2';
};
const formatDateTime = (date: string) => {
  if (!date) return 'Indefinido';
  return new Date(date).toLocaleString('es-ES', {
    day: 'numeric',    // Día
    month: 'numeric',  // Mes
    year: 'numeric',   // Año
  });
};
const capitalizeFirstLetter = (str: string) => {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
</script>

<template>
    <v-form v-model="valid" @submit.prevent="submitEnroll">
        <v-dialog v-model="isActive"  transition="dialog-bottom-transition" class="dialog-mw">
            <template v-slot:activator="{ props }">
                <v-btn color="primary" class="w-100" v-bind="props" flat>{{ hasSubmitted ? 'Ver Mi Solicitud' : 'Solicitar Participar' }}</v-btn>
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
                                <v-alert v-if="!hasSubmitted" type="info" variant="tonal" class="mb-3">
                                    Completa tu solicitud de forma concisa. No podrás editarla una vez enviada, pero sí consultarla o eliminarla. El envío no garantiza la participación; el docente debe aprobarla.
                                </v-alert>
                            </v-col>
                            <v-col cols="12">
                                <span v-if="!hasSubmitted" class="h4">{{ currUser?.name.toUpperCase() }} {{ currUser?.lastName.toUpperCase() }}</span>
                                <span v-else class="font-weight-semibold">{{ enroll.name }}</span>
                            </v-col>

                            <v-col cols="12" v-if="hasSubmitted">
                                <span class="font-weight-semibold">Fecha: {{ formatDateTime(enroll.dateCreated) }}</span>
                            </v-col>
                            <v-col cols="12" v-if="hasSubmitted">
                                <span class="font-weight-semibold">Estado:</span>
                                <v-chip class="font-weight-bold bg-light" :color="getStatusColor(enroll.status)" size="small" rounded="sm">
                                    {{ capitalizeFirstLetter(enroll?.status || '') }}
                                </v-chip>
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-if="!hasSubmitted" v-model="enroll.comments" :rules="notEmptyRule" label="Comentarios" required></v-textarea>
                                <div v-else class="bg-light mt-4 pa-4 rounded-md">
                                    <span class="font-weight-semibold">Comentarios</span><br/>
                                    <span class="v-text">{{ enroll.comments }}</span>
                                </div>
                            </v-col> 
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
