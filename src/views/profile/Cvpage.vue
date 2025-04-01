<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';
import axios from 'axios';
// components
import ProfileBanner from '@/components/profile/ProfileBanner.vue';

const authStore = useAuthStore();
const route = useRoute();
// Valores computados para establecer al usuario
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;

const pageTitle = computed(() => isOwnProfile ? 'Mi Perfil' : 'Perfil de Usuario');
const breadcrumbs = ref([
    {
        text: 'Dashboard',
        disabled: false,
        href: '/'
    },
    {
        text: 'Perfil de Usuario',
        disabled: true,
        href: '#'
    }
]);

// Estado para almacenar la URL del CV
const cvUrl = ref<string | null>(null);
// Estado para manejar el proceso de carga del archivo
const file = ref<File | null>(null);

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:3000/profiles/download-cv/${userId.value}`);
    console.log('response', response)
    cvUrl.value = response.data.cvUrl; // Almacenar la URL del PDF
  } catch (error) {
    console.error('Error al obtener cv url:', error);
  }
});

const uploadCV = async () => {
    try {
        if (!file.value) return;

        const formData = new FormData();
        formData.append('file', file.value);

        try {
            const response = await axios.post(`http://localhost:3000/profiles/upload-cv/${userId.value}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
            });
            cvUrl.value = response.data.fileUrl; // Actualizar la URL del CV
        } catch (error) {
            console.error('Error al subir el CV:', error);
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
        file.value = input.files[0]; // Guardar el archivo seleccionado
    }
};
</script>

<template>
    <BaseBreadcrumb :title="pageTitle" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <ProfileBanner 
        :userId="userId"
    />

    <v-card class="mb-3 pa-5 my-5" v-if="isOwnProfile">
        <v-row>
            <v-col cols="6">
                <v-file-input
                label="Cargar currículum vitae en archivo pdf"
                @change="onFileChange"
                accept="application/pdf"
                prepend-icon="mdi-file"
                ></v-file-input>
                <v-btn @click="uploadCV" color="primary">Guardar CV</v-btn>
            </v-col>
            <v-col cols="6">
                <v-alert type="info" variant="tonal" class="mb-3">
                    Aquí puedes subir tu CV en formato PDF (máximo 10 MB). Ten en cuenta que este archivo será público y otros usuarios podrán verlo y descargarlo.
                </v-alert>
            </v-col>
        </v-row>
    </v-card>

    <!-- Vista previa del CV -->
    <v-card class="mb-3 pa-5 my-5">
        <v-row>
            <v-col cols="12">
                <v-alert  v-if="cvUrl" type="info" variant="tonal" class="mb-3">
                    Este es el currículum vitae disponible para su visualización a continuación. Aquí podrás conocer más sobre su experiencia, habilidades y formación profesional. El CV está publicado de manera pública, por lo que otros usuarios pueden verlo directamente.
                </v-alert>
                <v-alert v-else type="info" variant="tonal" class="mb-3">
                    <h4 class="bold">El estudiante aún no ha subido su CV.</h4>
                    <span>
                        Es posible que prefiera mantenerlo privado, pero puedes explorar el resto de su perfil para conocer más sobre su experiencia y habilidades. Si ya cuentas con sus datos de contacto, también puedes comunicarte directamente con él o ella para obtener más información.
                    </span>
                </v-alert>
            </v-col>
            <v-col cols="12" v-if="cvUrl">
                <iframe :src="cvUrl" width="100%" height="600px" frameborder="0"></iframe>
            </v-col>
        </v-row>
    </v-card>
</template>
