<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import EditorMenubar from '@/components/plugins/editor/EditorMenubar.vue';
import StarterKit from '@tiptap/starter-kit';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const userId = authStore.userId;

const page = ref({ title: 'Nueva Oferta Laboral' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Crear Vacante', disabled: true, href: '#' }
]);

const vacant = ref({
    name: '',
    description: '',
    requirements: '',
    location: '',
    category: '',
    modality: '',
    level: '',
    company: '',
    salary: 0,
    salaryPeriod: '',
    dateCreated: new Date().toISOString(),
    userId: userId
});

const skills = ref<string[]>([]);
const newSkill = ref<string>('');

const editor = useEditor({
    extensions: [StarterKit]
});

const valid = ref(false);
const modalityOps = ['Presencial', 'Remoto', 'Hibrido'];
const salaryPeriodOps = ['Semanal', 'Quincenal', 'Mensual'];
const rules = [(v: any) => !!v || 'Es obligatorio llenar este campo.'];
const error = ref<string | null>(null);

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

// Hacer la petición HTTP cuando el componente se monte
onMounted(async () => {
  try {
    const userResponse = await axios.get(`http://localhost:3000/users/user/${userId}`);
    //console.log('userResponse', userResponse.data)
    vacant.value.company = userResponse.data.profile.jobCompany;
  } catch (err) {
    console.error('Error al obtener los posts:', err);
    const errorAxios = err as AxiosError;
    if (errorAxios.response) {
        error.value = 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
});

const submitVacant = async () => {
    if (valid.value) {
        try {
            vacant.value.description = editor.value ? editor.value.getHTML() : '';
            if (vacant.value.description && vacant.value.description != '' && vacant.value.description != '<p></p>') {
                if (skills.value.length && skills.value.length > 0) {
                    vacant.value.requirements = skills.value.join(',');
                    console.log('vacant value', vacant.value)
                    await axios.post('http://localhost:3000/vacancies/create', vacant.value);
                    router.push('/vacancies/list-all');
                }
                else {
                    error.value = 'Es obligatorio agregar habilidades requeridas.';
                }
            }
            else {
                error.value = 'Es obligatorio agregar una descripción.';
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
            <h5 class="text-20 mb-7">Crear nueva oferta laboral</h5>
            <p class="textSecondary">Empresa: {{ vacant.company }}</p>
            <!-- Display the current date -->
            <v-col cols="12">
                <v-alert v-if="error" type="error" variant="tonal" dismissible>
                    {{ error }}
                </v-alert>
            </v-col>
            <v-form v-model="valid">
                <div class="bg-light mt-6 pa-6 rounded-md">
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Título</v-label>
                            <v-text-field v-model="vacant.name" :rules="rules" required />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Categoría</v-label>
                            <v-text-field v-model="vacant.category" :rules="rules" required />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Modalidad</v-label>
                            <v-select v-model="vacant.modality" :items="modalityOps" :rules="rules" required />
                        </v-col>

                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Ubicación</v-label>
                            <v-text-field v-model="vacant.location" />
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Nivel</v-label>
                            <v-text-field v-model="vacant.level" :rules="rules" required />
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-label class="font-weight-semibold pb-2">Salario</v-label>
                            <v-text-field v-model="vacant.salary" type="number"  min="0"/>
                        </v-col>
                        <v-col cols="12" md="2">
                            <v-label class="font-weight-semibold pb-2">Periodo</v-label>
                            <v-select v-model="vacant.salaryPeriod" :items="salaryPeriodOps" />
                        </v-col>

                        <!-- Description text editor -->
                        <v-col cols="12">
                            <v-label class="font-weight-semibold pb-2">Descripción</v-label>
                            <v-card variant="outlined">
                                <div v-if="editor">
                                    <EditorMenubar :editor="editor" />
                                </div>
                                <editor-content :editor="editor" />
                            </v-card>
                        </v-col>

                        <!-- Habilidades requeridas -->
                        <v-col cols="12" md="4">
                            <v-label class="font-weight-semibold pb-2">Habilidades Requeridas</v-label>
                            <v-text-field v-model="newSkill" label="Añadir nueva habilidad" placeholder="Ej: JavaScript, Diseño UX, Marketing Digital"
                                variant="outlined" hide-details="auto" class="mb-4" @keyup.enter="addSkill(newSkill)"
                            >
                                <template v-slot:append>
                                    <v-btn color="success" size="sm" icon="mdi-plus" :disabled="!newSkill.trim()" @click="addSkill(newSkill)"></v-btn>
                                </template>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-chip-group class="scrollable-chips">
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
                    <v-btn :disabled="!valid" flat color="primary" @click="submitVacant" class="mt-6">Crear Vacante</v-btn>
                </div>
            </v-form>
        </v-card-item>
    </v-card>
</template>

<style lang="scss"></style>
