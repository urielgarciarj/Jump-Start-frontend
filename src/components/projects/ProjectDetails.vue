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
const aceptedEnrollsList = ref<any[]>([]);
const pendingEnrollsList = ref<any[]>([]);

const showEditForm = ref(false);
const showConfirmation = ref(false);
const error = ref<string | null>(null);
const tab = ref(null);
const statusColors = {
  "abierto": "info",
  "progreso": "primary",
  "completado": "success",
  "cancelado": "error"
};
/*Header Data [Table headers and sorting]*/
const sortBy:any  = ref([
    { key: 'name', order: 'desc' }
]);
const headers : any = ref([
    { title: '', align: 'start', key: 'picture', sortable: false },
    { title: 'Nombre', align: 'start', key: 'name' },
    { title: 'Fecha', align: 'start', key: 'dateCreated' },
    { title: 'Comentarios', align: 'start', key: 'comments', sortable: false },
    { title: 'Acciones', align: 'start', key: '', sortable: false }
]);

onMounted(async () => {
    try {
        const response = await axios.get(`http://localhost:3000/projects/project/detail/${projectId}`);
        if (!response.data) { // If no response data, throw error
            error.value = 'Oferta laboral no encontrada.';
        } else { // The vacant belong to the currUser, proceed to get applications 
            projectDetail.value = response.data;
            // Get enrolls related
            const _response = await axios.get(`http://localhost:3000/enrolls/list-by/project/${projectId}`);
            pendingEnrollsList.value = _response.data.filter((e: { status: string; }) => e.status === 'Pendiente');
            aceptedEnrollsList.value = _response.data.filter((e: { status: string; }) => e.status === 'Aceptado');
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
        await axios.delete(`http://localhost:3000/projects/delete/${projectId}`);
        router.push('/projects/list-all');
    } catch (err) {
        console.log('Error', err);
    }
    showConfirmation.value = false;
};

// Funciones para notificar sobre enrolls
const showAlert = ref(false); // Controlar la visibilidad del snackbar
const alertType = ref<'success' | 'error' | 'info' | 'warning'>('success');
const snackbarMessage = ref(''); // Mensaje para mostrar en el snackbar
const handleEnrollSaved = (success: boolean) => {
    if (success) {
        snackbarMessage.value = '¡Tu solicitud fue enviada con éxito!';
        alertType.value = 'success';
    } else {
        snackbarMessage.value = 'Hubo un error al enviar la solicitud. Intenta nuevamente.';
        alertType.value = 'error';
    }
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 5000);
};
const handleEnrollDeleted = (success: boolean) => {
    if (success) {
        snackbarMessage.value = '¡Tu solicitud fue eliminada!';
        alertType.value = 'success';
    } else {
        snackbarMessage.value = 'Hubo un error al eliminar la solicitud. Intenta nuevamente.';
        alertType.value = 'error';
    }
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 5000);
};

const aceptOrRejectStudent = (enrollId: string, status: string) => {
    try {
        if (!enrollId || !status) return;
        // Actualizar desde backend y db
        const response = axios.put(`http://localhost:3000/enrolls/update-status/${enrollId}/${status}`);
        // Update component
        if (status === 'Aceptado') {
            // Buscar el estudiante en la lista de pendientes
            const studentIndex = pendingEnrollsList.value.findIndex(enroll => enroll.id === enrollId);
            if (studentIndex !== -1) { // Mover el estudiante a la lista de aceptados
                const [student] = pendingEnrollsList.value.splice(studentIndex, 1);
                aceptedEnrollsList.value.push(student);
            }
        } else if (status === 'Rechazado') {
            // Eliminar el estudiante de la lista de pendientes
            pendingEnrollsList.value = pendingEnrollsList.value.filter(enroll => enroll.id !== enrollId);
        }
    } catch(err) {
        console.error('Error:', err);
        const errorAxios = err as AxiosError;
        // Manejar el error en función del código de estado
        if (errorAxios.response) {
            error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
        }
    }
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
    <v-alert v-if="showAlert" :type="alertType"  variant="tonal" class="mb-3" dismissible @mouseleave="showAlert = false">
        <template v-slot:prepend>
        <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
        </template>
        <div>{{ snackbarMessage }}</div>
    </v-alert>
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
                    <!-- Main information of the project -->
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
                            <EnrollForm :project="projectDetail?.id" @enrollSaved="handleEnrollSaved" @enrollDeleted="handleEnrollDeleted"/>
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
                    <!-- Data table with the ACEPTED students  -->
                    <v-window-item value="two">
                        <v-col cols="12">
                            <v-data-table items-per-page="5" :headers="headers" :items="aceptedEnrollsList" item-value="name"
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
                                        <td>{{ formatDateTime(item.dateCreated) }}</td>
                                        <td>{{ item.comments }}</td>
                                        <td>
                                            <!-- <div class="d-flex align-center">
                                                <v-tooltip text="Aceptar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="success" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Aceptado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                                <v-tooltip text="Rechazar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="error" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Rechazado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-close</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                            </div> -->
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                         </v-col>
                    </v-window-item>
                    <!-- Data table with the PENDING students  -->
                    <v-window-item value="three" v-if="projectDetail?.professor.id === userId">
                        <v-col cols="12">
                            <v-data-table items-per-page="5" :headers="headers" :items="pendingEnrollsList" item-value="name"
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
                                        <td>{{ formatDateTime(item.dateCreated) }}</td>
                                        <td>{{ item.comments }}</td>
                                        <td>
                                            <div class="d-flex align-center">
                                                <v-tooltip text="Aceptar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="success" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Aceptado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-checkbox-marked-circle-outline</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                                <v-tooltip text="Rechazar">
                                                    <template v-slot:activator="{ props }">
                                                        <v-btn icon flat class="mx-2" color="error" variant="tonal" size="sm" @click="aceptOrRejectStudent(item.id, 'Rechazado')" v-bind="props">
                                                            <v-icon class="text-24">mdi-close</v-icon>
                                                        </v-btn>
                                                    </template>
                                                </v-tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>
                         </v-col>
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

