<script setup lang="ts">
import { ref, watch } from 'vue';
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
    location: '',
    category: '',
    modality: '',
    level: '',
    company: 'Caramelos de la Rosa',
    salary: '',
    salaryPeriod: '',
    dateCreated: new Date().toISOString(),
    userId: userId
});
const editor = useEditor({
    extensions: [StarterKit]
});

const valid = ref(false);
const modalityOps = ['Presencial', 'Remoto', 'Hibrido'];
const salaryPeriodOps = ['Semanal', 'Quincenal', 'Mensual'];
const rules = [(v: any) => !!v || 'Es obligatorio llenar este campo.'];
const error = ref<string | null>(null);

const submitVacant = async () => {
    if (valid.value) {
        try {
            vacant.value.description = editor.value ? editor.value.getHTML() : '';
            if (vacant.value.description && vacant.value.description != '' && vacant.value.description != '<p></p>') {
                const response = await axios.post('http://localhost:3000/vacancies/create', vacant.value);
                //console.log('vacant created:', response.data);
                router.push('/vacancies/list-all');
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
            <p class="textSecondary">Empresa: La empresa en mi perfil ovio</p>
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
                            <v-select v-model="vacant.modality" :items="modalityOps" required />
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
