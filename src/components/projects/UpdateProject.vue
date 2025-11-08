<script setup lang="ts">
import { computed, ref } from 'vue';
import axios, { AxiosError } from 'axios';
import { defineProps, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
    project: Object, // Recibe la vacante que se va a editar
});
const emit = defineEmits(['updateProject', 'cancelEdit']); // Emitir eventos para actualizar o cancelar la edición

const updateName = ref(props.project?.name || '');
const updateStatus = ref(props.project?.status || '');
const updateCategory = ref(props.project?.category || '');
const updateDescription = ref(props.project?.description || '');
const updateRequirements = ref(props.project?.requirements ? props.project.requirements.split(',') : []);
const updateStartDate = ref(props.project?.startDate || '');
const updateEndDate = ref(props.project?.endDate || '');

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

const newSkill = ref<string>('');
const valid = ref(false);
const error = ref<string | null>(null);
const notEmptyRule = [
  (value: string) => !!value || 'Este campo es obligatorio.'
];

// Función para cancelar la edición
const cancelEdit = () => {
  emit('cancelEdit');
};

const submitVacant = async () => {
    if (valid.value) {
        try {
            if (updateRequirements.value.length && updateRequirements.value.length > 0) {
                const projectData = {
                    name: updateName.value,
                    category: updateCategory.value,
                    status: updateStatus.value,
                    description: updateDescription.value,
                    requirements: updateRequirements.value.join(','),
                    startDate: updateStartDate.value,
                    endDate: updateEndDate.value
                }
                const response = await axios.put(`http://localhost:3000/projects/updateFields/${props.project?.id}`, projectData);
                // Emitir evento para actualizar el proyecto en el componente principal
                emit('updateProject', {...props.project,...response.data,});
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

// Añadir skill
const addSkill = (skillToAdd: string) => {
  if (skillToAdd && !updateRequirements.value.some((s: string) => s.toLowerCase() === skillToAdd.toLowerCase())) {
    updateRequirements.value.push(skillToAdd);  // Añadir la habilidad al array
    newSkill.value = '';  // Limpiar el campo de entrada
    console.log('Skill added:', updateRequirements.value);  // Depuración
  }
};

const removeSkill = (skillIndex: number) => {
    updateRequirements.value.splice(skillIndex, 1);
    console.log('skill removed', updateRequirements.value)
};

// Formatear fecha a 'YYYY-MM-DD'
const formatDefaultDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1);
    const day = d.getDate();
    // Aseguramos que mes y día siempre tengan 2 dígitos
    const formattedMonth = month < 10 ? '0' + month : month;
    const formattedDay = day < 10 ? '0' + day : day;
    
    return `${year}-${formattedMonth}-${formattedDay}`;
};
// Computada para obtener el valor formateado de la fecha de inicio
const formattedStartDate = computed(() => formatDefaultDate(updateStartDate.value));
const formattedEndDate = computed(() => formatDefaultDate(updateEndDate.value));

</script>

<template>
    <div class="edit-project-form">
        <div class="edit-form-header mb-4">
            <Icon icon="mdi:pencil-outline" height="20" class="mr-2" />
            <span class="text-subtitle-1 font-weight-bold">Editar Proyecto</span>
        </div>
        
        <v-col cols="12">
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
                            v-model="updateName" 
                            :rules="notEmptyRule" 
                            required
                            variant="outlined"
                            rounded="lg"
                            color="primary"
                            hide-details="auto"
                        />
                    </v-col>

                    <v-col cols="12" md="3">
                        <v-label class="mb-2 font-weight-medium text-body-1">Fecha de Inicio</v-label>
                        <v-text-field 
                            v-model="updateStartDate" 
                            :value="formattedStartDate" 
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
                            v-model="updateEndDate" 
                            :value="formattedEndDate" 
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
                            v-model="updateCategory" 
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
                            v-model="updateStatus" 
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
                            v-model="updateDescription" 
                            :rules="notEmptyRule" 
                            required
                            variant="outlined"
                            rounded="lg"
                            color="primary"
                            rows="5"
                            hide-details="auto"
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
                        
                        <div v-if="updateRequirements.length > 0" class="skills-container pa-3">
                            <v-chip-group class="scrollable-chips">
                                <v-chip
                                    v-for="(skill, index) in updateRequirements"
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
                    @click="cancelEdit" 
                    variant="tonal" 
                    rounded="lg"
                    class="cancel-btn"
                >
                    Cancelar
                </v-btn>
                <v-btn 
                    @click="submitVacant" 
                    :disabled="!valid || updateRequirements.length === 0" 
                    color="primary" 
                    variant="flat"
                    rounded="lg"
                    class="save-btn"
                >
                    <Icon icon="mdi:check" height="18" class="mr-2" />
                    Guardar Cambios
                </v-btn>
            </div>
        </v-form>
    </div>
</template>

<style scoped>
.edit-project-form {
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