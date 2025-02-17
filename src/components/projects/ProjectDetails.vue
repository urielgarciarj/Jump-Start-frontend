<script setup lang="ts">
import { onMounted, ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios, { AxiosError } from 'axios';
import { router } from '@/router';
import UpdateProjectForm from './UpdateProject.vue';
import EnrollForm from './enrolls/CreateEnrollForm.vue';

const page = ref({ title: 'Detalles del Proyecto' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Detalles Proyecto', disabled: true, href: '#' }
]);

const route = useRoute();
const authStore = useAuthStore();
const userId = authStore.userId;
const userRole = authStore.userRole;

const projectId = route.params.id;

const projectDetail = ref<any | null>(null);
const enrollsList = ref<any[]>([]);

const showEditForm = ref(false);
const showConfirmation = ref(false);
const error = ref<string | null>(null);
const tab = ref(null);
const statusColors = {
  "pendiente": "info",
  "progreso": "primary",
  "terminado": "success",
  "cancelado": "error"
};

onMounted(async () => {
    try {
        const response = await axios.get(`http://localhost:3000/projects/project/detail/${projectId}`);
        //console.log('response data', response.data)
        
        if (!response.data) { // If no response data, throw error
            error.value = 'Oferta laboral no encontrada.';
        } else { // The vacant belong to the currUser, proceed to get applications 
            projectDetail.value = response.data;
            // Get applications related
            // const _response = await axios.get(`http://localhost:3000/applications/list-by/vancant/${vacantId}`);
            // console.log('Get appl list', _response.data);
            // applicationsList.value = _response.data;
        }
    } catch (err) {
        console.error('Error:', err);
        const errorAxios = err as AxiosError;
        // Manejar el error en función del código de estado
        if (errorAxios.response) {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
    }
});

// Función para editar un proyecto
const editProject = () => {
  showEditForm.value = true;
};

// Función para cancelar la edición
const cancelEdit = () => {
  showEditForm.value = false;
};

// Función para manejar la actualización del proyecto
const handleUpdateProject = (updatedProject: 
    { name: any; status: any; category: any; description: any; requirements: any; startDate: any; endDate: any; }) => {
    if (projectDetail.value) {
        projectDetail.value.name = updatedProject.name;
        projectDetail.value.status = updatedProject.status;
        projectDetail.value.category = updatedProject.category;
        projectDetail.value.description = updatedProject.description;
        projectDetail.value.requirements = updatedProject.requirements;
        projectDetail.value.startDate = updatedProject.startDate;
        projectDetail.value.endDate = updatedProject.endDate;
    }
  showEditForm.value = false;
};

//Funcion para manejar eliminar un proyecto
const handleDeleteProject = () => { 
    showConfirmation.value = true; 
};

const confirmDelete = async () => {
    try {
        console.log('se confirmo que se elimina este proyecto');
        // await axios.delete(`http://localhost:3000/vacancies/delete/${vacantId}`);
        // router.push('/vacancies/list-all');
    } catch (err) {
        console.log('Error', err);
    }
    showConfirmation.value = false;
};


const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || '';  
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
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
    <v-card elevation="10">
        <!-- Tabs para detalle - solicitudes -->
        <v-card-item>
            <v-tabs v-model="tab" color="primary" class="border-bottom">
                <v-tab value="one">General</v-tab>
                <v-tab value="two">Participantes</v-tab>
                <v-tab value="three" v-if="projectDetail?.professor.id === userId">Solicitudes</v-tab>
            </v-tabs>
            <div class="mt-5">
                <v-row v-if="error">
                    <v-col cols="12">
                        <v-alert v-if="error" type="error" variant="tonal" dismissible>
                            {{ error }}
                        </v-alert>
                    </v-col>
                </v-row>
                <v-window v-model="tab" v-if="!error">
                    <v-window-item value="one">
                        <!-- Only view -->
                        <div v-if="!showEditForm" class="bg-light mt-6 pa-6 rounded-md">
                            <v-row>
                                <v-col cols="12" md="12">
                                    <h3>Proyecto: {{ projectDetail?.name }}</h3>
                                    <span class="text-subtitle-2 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ projectDetail?.professor.name }} {{ projectDetail?.professor.lastName }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Fecha de Inicio</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ formatDateTime(projectDetail?.startDate) }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Fecha Fin</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ formatDateTime(projectDetail?.endDate) }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Categoría</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                                        {{ projectDetail?.category }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <h3>Estado</h3>
                                    <v-chip class="font-weight-bold bg-light" :color="getStatusColor(projectDetail?.status)" size="small" rounded="sm">
                                        {{ capitalizeFirstLetter(projectDetail?.status || '') }}
                                    </v-chip>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <h3>Descripción</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        {{ projectDetail?.description }}
                                    </span>
                                </v-col>
                                <v-col cols="12" md="12">
                                    <h3>Requerimientos</h3>
                                    <span class="text-subtitle-1 opacity-50">
                                        {{ projectDetail?.requirements }}
                                    </span>
                                </v-col>
                            </v-row>
                        </div>
                        <!-- Botones para editar - eliminar -->
                        <div v-if="!showEditForm && projectDetail?.professor.id === userId" class="d-flex ga-3 justify-end mt-6">
                            <v-btn @click.stop="handleDeleteProject()" color="error" flat >
                                Eliminar
                            </v-btn>
                            <v-btn  @click.stop="editProject()" color="primary" flat
                                >Editar</v-btn
                            >
                        </div>
                        <!-- Boton para enviar solicitud *solo estudiantes -->
                        <div v-if="!showEditForm && userRole.toLowerCase() === 'estudiante'" class="d-flex ga-3 justify-end mt-6">
                            <EnrollForm :project="projectDetail?.id"/>
                        </div>

                        <!-- Editing form -->
                        <div v-if="showEditForm && projectDetail?.professor.id === userId">
                            <UpdateProjectForm
                                :project="projectDetail"
                                @updateProject="handleUpdateProject"
                                @cancelEdit="cancelEdit()"
                            />
                        </div>
                    </v-window-item>
                    <v-window-item value="two">
                        <!-- <ProductReview /> -->
                         <!-- <v-col cols="12">
                            <UiParentCard title="Solicitudes recibidas">
                                <v-data-table items-per-page="5" :headers="headers" :items="applicationsList" item-value="name"
                                    v-model:sort-by="sortBy" class="border rounded-md datatabels">
                                    <template v-slot:item="{ item }">
                                        <tr>
                                        <td>
                                            <v-avatar size="32" class="text-h5 font-weight-medium"> 
                                                <template v-if="item.user.profile?.picture">
                                                    <img :src="item.user.profile?.picture" alt="icon" height="32" />
                                                </template>
                                                <template v-else>
                                                    {{ item.name.charAt(0).toUpperCase() }}
                                                </template>
                                            </v-avatar>
                                        </td>
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.email }}</td>
                                        <td>{{ item.phoneNumber }}</td>
                                        <td>{{ formatDateTime(item.dateCreated) }}</td>
                                        <td>{{ item.interested }}</td>
                                        <td>{{ item.proficiency }}</td>
                                        </tr>
                                    </template>
                                </v-data-table>
                            </UiParentCard>
                         </v-col> -->
                    </v-window-item>
                    <v-window-item value="three" v-if="projectDetail?.professor.id === userId">

                    </v-window-item>
                </v-window>
            </div>
        </v-card-item>
    </v-card>

    <!-- Confirmation Dialog Delete Project-->
    <v-dialog v-model="showConfirmation" max-width="500px">
        <v-card>
            <v-card-title class="pa-4 bg-primary">Eliminar Proyecto</v-card-title>
            <v-card-text>
                <h5 class="text-16">¿Estás seguro de que deseas eliminar este proyecto?</h5>
                <h6>Al eliminar el proyecto, los participantes ya no podrán acceder a él y todas las solicitudes asociadas serán canceladas de manera permanente.</h6>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn variant="tonal" class="px-4" @click="showConfirmation = false">Cancelar</v-btn>
                <v-btn color="error" class="px-4" variant="tonal" @click="confirmDelete">Si, Eliminar</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

