<script setup lang="ts">
import { ref } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { Icon } from '@iconify/vue';

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
    status: 'abierto',
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
  }
};
// Remove skill
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
                error.value = 'Es obligatorio agregar habilidades requeridas.';
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
    <v-card variant="outlined" rounded="lg" class="create-project-card">
        <v-card-title class="pa-6 bg-primary text-white create-project-header">
            <div class="d-flex align-center">
                <div class="header-icon-wrapper mr-3">
                    <Icon icon="mdi:folder-plus-outline" height="24" />
                </div>
                <span class="text-h6 font-weight-bold">Nuevo Proyecto Académico</span>
            </div>
        </v-card-title>
        
        <v-card-item class="pa-6">
            <v-col cols="12" v-if="error">
                <v-alert 
                    v-if="error" 
                    type="error" 
                    variant="tonal" 
                    dismissible
                    rounded="lg"
                    class="mb-4"
                >
                    {{ error }}
                </v-alert>
            </v-col>
            
            <v-form v-model="valid">
                <div class="form-content pa-6">
                    <v-row>
                        <v-col cols="12" md="12">
                            <v-label class="mb-2 font-weight-medium text-body-1">Nombre del proyecto</v-label>
                            <v-text-field 
                                v-model="project.name" 
                                :rules="notEmptyRule" 
                                required
                                variant="outlined"
                                rounded="lg"
                                color="primary"
                                hide-details="auto"
                                placeholder="Escribe un nombre descriptivo para tu proyecto"
                            />
                        </v-col>
                        
                        <v-col cols="12" md="3">
                            <v-label class="mb-2 font-weight-medium text-body-1">Fecha de Inicio</v-label>
                            <v-text-field 
                                v-model="project.startDate" 
                                type="date" 
                                :rules="notEmptyRule" 
                                required
                                variant="outlined"
                                rounded="lg"
                                color="primary"
                                hide-details="auto"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-label class="mb-2 font-weight-medium text-body-1">Fecha Fin</v-label>
                            <v-text-field 
                                v-model="project.endDate" 
                                type="date"
                                variant="outlined"
                                rounded="lg"
                                color="primary"
                                hide-details="auto"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-label class="mb-2 font-weight-medium text-body-1">Categoría</v-label>
                            <v-select 
                                v-model="project.category" 
                                :items="categoryOptions" 
                                :rules="notEmptyRule" 
                                required
                                variant="outlined"
                                rounded="lg"
                                color="primary"
                                hide-details="auto"
                            />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-label class="mb-2 font-weight-medium text-body-1">Estado</v-label>
                            <v-select 
                                v-model="project.status" 
                                :items="statusesOptions" 
                                item-title="text" 
                                item-value="value" 
                                :rules="notEmptyRule" 
                                required
                                variant="outlined"
                                rounded="lg"
                                color="primary"
                                hide-details="auto"
                            />
                        </v-col>
                        
                        <v-col cols="12">
                            <v-label class="mb-2 font-weight-medium text-body-1">Descripción</v-label>
                            <v-textarea 
                                v-model="project.description" 
                                :rules="notEmptyRule" 
                                required
                                variant="outlined"
                                rounded="lg"
                                color="primary"
                                rows="5"
                                hide-details="auto"
                                placeholder="Describe los objetivos, metodología y alcance del proyecto..."
                            />
                        </v-col>
                        
                        <v-col cols="12">
                            <v-label class="mb-2 font-weight-medium text-body-1">Habilidades Requeridas</v-label>
                            <v-text-field 
                                v-model="newSkill" 
                                label="Añadir nueva habilidad" 
                                placeholder="Ej: JavaScript, Diseño UX, Marketing Digital"
                                variant="outlined" 
                                hide-details="auto" 
                                class="mb-4" 
                                @keyup.enter="addSkill(newSkill)"
                                rounded="lg"
                                color="primary"
                            >
                                <template v-slot:append>
                                    <v-btn 
                                        color="success" 
                                        size="sm" 
                                        icon="mdi-plus" 
                                        :disabled="!newSkill.trim()" 
                                        @click="addSkill(newSkill)"
                                        rounded="lg"
                                    ></v-btn>
                                </template>
                            </v-text-field>
                            
                            <div v-if="skills.length > 0" class="skills-container pa-3">
                                <v-chip-group class="scrollable-chips">
                                    <v-chip
                                        v-for="(skill, index) in skills"
                                        :key="index"
                                        closable
                                        @click:close="removeSkill(index)"
                                        color="primary"
                                        variant="tonal"
                                        size="small"
                                        class="ma-1 skill-chip"
                                    >
                                        {{ skill }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                            <v-alert
                                v-else
                                type="info"
                                variant="tonal"
                                rounded="lg"
                                class="mt-2"
                            >
                                <div class="text-caption">Añade al menos una habilidad requerida para el proyecto.</div>
                            </v-alert>
                        </v-col>
                    </v-row>
                </div>

                <div class="d-flex align-center justify-end ga-3 mt-6">
                    <v-btn 
                        variant="tonal" 
                        to="/projects/list-all" 
                        rounded="lg"
                        class="cancel-btn"
                    >
                        Cancelar
                    </v-btn>
                    <v-btn 
                        :disabled="!valid || skills.length === 0" 
                        color="primary" 
                        variant="flat"
                        @click="submitProject" 
                        rounded="lg"
                        class="create-btn"
                    >
                        <Icon icon="mdi:check" height="18" class="mr-2" />
                        Crear Proyecto
                    </v-btn>
                </div>
            </v-form>
        </v-card-item>
    </v-card>
</template>

<style scoped>
.create-project-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.create-project-header {
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%) !important;
}

.header-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.form-content {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.skills-container {
    background: rgba(99, 102, 241, 0.03);
    border-radius: 10px;
    border: 1px dashed rgba(99, 102, 241, 0.2);
    min-height: 60px;
}

.scrollable-chips {
    max-height: 200px;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-chip {
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.skill-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.cancel-btn {
    text-transform: none;
    font-weight: 500;
}

.create-btn {
    font-weight: 600;
    text-transform: none;
    transition: all 0.2s ease;
}

.create-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}
</style>

