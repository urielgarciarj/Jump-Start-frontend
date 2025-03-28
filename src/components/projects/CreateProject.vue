<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';
import axios from 'axios';

const page = ref({ title: 'Nuevo Proyecto' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Nuevo Proyecto', disabled: true, href: '#' }
]);

const router = useRouter();
const authStore = useAuthStore();
const userId = authStore.userId;

const project = ref({
    name: '',
    category: '',
    status: '',
    description: '',
    requirements: '',
    startDate: '',
    endDate: '',
    dateCreated: new Date().toISOString(),
    idTeacher: userId
});

const skills = ref<string[]>([]);
const newSkill = ref<string>('');

const statusesOptions = [
  { text: 'Abierto', value: 'abierto' },
  { text: 'Progreso', value: 'progreso' },
  { text: 'Completado', value: 'completado' },
  { text: 'Cancelado', value: 'cancelado' }
];
const categoryOptions = [
    "Proyectos de Investigación", "Proyectos de Creación", "Proyectos de Innovación",
    "Proyectos de Comunicación",  "Proyectos de Servicio a la Comunidad", "Proyectos de Emprendimiento",
    "Proyectos de Expresión Artística", "Proyectos de Tecnología y Programación", "Proyectos de Sostenibilidad y Medio Ambiente",
    "Proyectos de Educación y Mentoría", "Proyectos de Competencias y Desafíos", "Proyectos de Salud y Bienestar",
    "Proyectos de Historia y Cultura", "Proyectos de Ingeniería y Construcción", "Proyectos Recreativos"
];

const valid = ref(false);
const error = ref<string | null>(null);
const notEmptyRule = [
  (value: string) => !!value || 'Este campo es obligatorio.'
];

// Añadir skill
const addSkill = (skillToAdd: string) => {
  if (skillToAdd && !skills.value.some(s => s.toLowerCase() === skillToAdd.toLowerCase())) {
    skills.value.push(skillToAdd);  // Añadir la habilidad al array
    newSkill.value = '';  // Limpiar el campo de entrada
    console.log('Skill added:', skills.value);  // Depuración
  }
};

const removeSkill = (skillIndex: number) => {
    skills.value.splice(skillIndex, 1);
    console.log('skill removed', skills.value)
};

const submitProject = async () => {
    if (valid.value) {
        try {
            if (skills.value.length && skills.value.length > 0) {
                project.value.requirements = skills.value.join(',');
                await axios.post('http://localhost:3000/projects/create', project.value);
                router.push('/projects/list-all');                
            } 
            else {
                error.value = 'Es obligatorio agregar requerimientos/habilidades.';
            }
            
        } catch (err) {
            console.error('Error:', err);
            const errorAxios = err as AxiosError;
            // Manejar el error en función del código de estado
            if (errorAxios.response) {
                error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
            }
        }
    }
};
</script>

<template>
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
   <v-card elevation="10">
        <v-card-item>
            <v-col cols="12" v-if="error">
                <v-alert v-if="error" type="error" variant="tonal" dismissible>
                    {{ error }}
                </v-alert>
            </v-col>
            <v-form v-model="valid">
                <div class="bg-light mt-6 pa-6 rounded-md">
                    <v-row>
                        <v-col cols="12" md="12">
                            <v-label class="font-weight-semibold pb-2">Nombre del proyecto</v-label>
                            <v-text-field v-model="project.name" :rules="notEmptyRule" required />
                        </v-col>
                        
                        <v-col cols="12" md="3">
                            <v-label class="font-weight-semibold pb-2">Fecha de Inicio</v-label>
                            <v-text-field v-model="project.startDate" type="date" :rules="notEmptyRule" required />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-label class="font-weight-semibold pb-2">Fecha Fin</v-label>
                            <v-text-field v-model="project.endDate" type="date" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-label class="font-weight-semibold pb-2">Categoría</v-label>
                            <v-select v-model="project.category" :items="categoryOptions" :rules="notEmptyRule" required />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-label class="font-weight-semibold pb-2">Estado</v-label>
                            <v-select v-model="project.status" :items="statusesOptions" item-title="text" item-value="value" :rules="notEmptyRule" required />
                        </v-col>
                        
                        <v-col cols="12">
                            <v-label class="font-weight-semibold pb-2">Descripción</v-label>
                            <v-textarea v-model="project.description" :rules="notEmptyRule" required />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Requerimientos</v-label>
                            <!-- <v-textarea v-model="project.requirements"  :rules="notEmptyRule" required /> -->
                            <v-text-field v-model="newSkill" label="Añadir nueva habilidad" placeholder="Ej: JavaScript, Diseño UX, Marketing Digital"
                                variant="outlined" hide-details="auto" class="mb-4" @keyup.enter="addSkill(newSkill)"
                            >
                                <template v-slot:append>
                                    <v-btn color="success" size="sm" icon="mdi-plus" :disabled="!newSkill.trim()" @click="addSkill(newSkill)"></v-btn>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-chip-group>
                                <v-chip
                                    v-for="(skill, index) in skills"
                                    :key="index"
                                    closable
                                    @click:close="removeSkill(index)"
                                    color="primary"
                                    variant="outlined"
                                >
                                    {{ skill }}
                                </v-chip>
                            </v-chip-group>
                        </v-col>
                    </v-row>
                </div>

                <div class="d-flex align-center justify-end ga-3">
                    <v-btn flat variant="tonal" to="/vacancies/list-all" class="mt-6">Cancelar</v-btn>
                    <v-btn :disabled="!valid" flat color="primary" @click="submitProject" class="mt-6">Crear Proyecto</v-btn>
                </div>
            </v-form>
        </v-card-item>
    </v-card>
</template>

