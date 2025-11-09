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
    <div class="create-vacant-page-modern">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
        
        <v-card class="create-vacant-card-modern" elevation="0">
            <div class="card-header-modern">
                <div class="header-content">
                    <div class="header-icon-wrapper">
                        <v-icon size="48" color="primary">mdi-briefcase-plus</v-icon>
                    </div>
                    <div class="header-text">
                        <h2 class="page-title">Crear Nueva Oferta Laboral</h2>
                        <p class="company-info">
                            <v-icon size="16" class="mr-1">mdi-office-building</v-icon>
                            Empresa: <strong>{{ vacant.company }}</strong>
                        </p>
                    </div>
                </div>
            </div>
            
            <v-card-item class="pa-6">
                <v-alert 
                    v-if="error" 
                    type="error" 
                    variant="tonal" 
                    dismissible
                    class="alert-modern mb-6"
                    border="start"
                >
                    <template v-slot:prepend>
                        <v-icon>mdi-alert-circle</v-icon>
                    </template>
                    {{ error }}
                </v-alert>
                
                <v-form v-model="valid" class="vacant-form-modern">
                    <!-- Información Básica -->
                    <div class="form-section-modern">
                        <div class="section-header">
                            <v-icon class="section-icon" color="primary">mdi-information-outline</v-icon>
                            <h3 class="section-title">Información Básica</h3>
                        </div>
                        
                        <v-row class="ma-0">
                            <v-col cols="12" md="4" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-format-title</v-icon>
                                        Título
                                    </v-label>
                                    <v-text-field 
                                        v-model="vacant.name" 
                                        :rules="rules" 
                                        required
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                        placeholder="Ej: Desarrollador Frontend"
                                        prepend-inner-icon="mdi-format-title"
                                    />
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="4" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-tag</v-icon>
                                        Categoría
                                    </v-label>
                                    <v-text-field 
                                        v-model="vacant.category" 
                                        :rules="rules" 
                                        required
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                        placeholder="Ej: Tecnología"
                                        prepend-inner-icon="mdi-tag"
                                    />
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="4" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-monitor</v-icon>
                                        Modalidad
                                    </v-label>
                                    <v-select 
                                        v-model="vacant.modality" 
                                        :items="modalityOps" 
                                        :rules="rules" 
                                        required
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                        prepend-inner-icon="mdi-monitor"
                                    />
                                </div>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- Ubicación y Nivel -->
                    <div class="form-section-modern">
                        <div class="section-header">
                            <v-icon class="section-icon" color="primary">mdi-map-marker</v-icon>
                            <h3 class="section-title">Ubicación y Detalles</h3>
                        </div>
                        
                        <v-row class="ma-0">
                            <v-col cols="12" md="4" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
                                        Ubicación
                                    </v-label>
                                    <v-text-field 
                                        v-model="vacant.location"
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                        placeholder="Ej: Ciudad, País"
                                        prepend-inner-icon="mdi-map-marker"
                                    />
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="4" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-account-star</v-icon>
                                        Nivel
                                    </v-label>
                                    <v-text-field 
                                        v-model="vacant.level" 
                                        :rules="rules" 
                                        required
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                        placeholder="Ej: Junior, Senior"
                                        prepend-inner-icon="mdi-account-star"
                                    />
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="2" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-currency-usd</v-icon>
                                        Salario
                                    </v-label>
                                    <v-text-field 
                                        v-model="vacant.salary" 
                                        type="number"  
                                        min="0"
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                        prepend-inner-icon="mdi-currency-usd"
                                    />
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="2" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-calendar-clock</v-icon>
                                        Periodo
                                    </v-label>
                                    <v-select 
                                        v-model="vacant.salaryPeriod" 
                                        :items="salaryPeriodOps"
                                        variant="outlined"
                                        density="comfortable"
                                        color="primary"
                                        class="form-input-modern"
                                    />
                                </div>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- Descripción -->
                    <div class="form-section-modern">
                        <div class="section-header">
                            <v-icon class="section-icon" color="primary">mdi-text</v-icon>
                            <h3 class="section-title">Descripción del Empleo</h3>
                        </div>
                        
                        <div class="editor-wrapper-modern">
                            <v-label class="form-label mb-3">Describe las responsabilidades y características del puesto</v-label>
                            <v-card variant="outlined" class="editor-card-modern">
                                <div v-if="editor">
                                    <EditorMenubar :editor="editor" />
                                </div>
                                <div class="editor-content-wrapper">
                                    <editor-content :editor="editor" />
                                </div>
                            </v-card>
                        </div>
                    </div>

                    <!-- Habilidades Requeridas -->
                    <div class="form-section-modern">
                        <div class="section-header">
                            <v-icon class="section-icon" color="primary">mdi-check-circle</v-icon>
                            <h3 class="section-title">Habilidades Requeridas</h3>
                        </div>
                        
                        <v-row class="ma-0">
                            <v-col cols="12" md="6" class="pa-2">
                                <div class="form-field-wrapper">
                                    <v-label class="form-label">
                                        <v-icon size="16" class="mr-1">mdi-plus-circle</v-icon>
                                        Añadir Habilidad
                                    </v-label>
                                    <v-text-field 
                                        v-model="newSkill" 
                                        placeholder="Ej: JavaScript, Diseño UX, Marketing Digital"
                                        variant="outlined" 
                                        hide-details="auto" 
                                        class="form-input-modern mb-4" 
                                        @keyup.enter="addSkill(newSkill)"
                                        prepend-inner-icon="mdi-tag-outline"
                                    >
                                        <template v-slot:append-inner>
                                            <v-btn 
                                                color="success" 
                                                size="small" 
                                                icon="mdi-plus" 
                                                :disabled="!newSkill.trim()" 
                                                @click="addSkill(newSkill)"
                                                variant="flat"
                                                class="add-skill-btn"
                                            ></v-btn>
                                        </template>
                                    </v-text-field>
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="6" class="pa-2">
                                <div class="skills-display-section">
                                    <v-label class="form-label mb-3">Habilidades agregadas ({{ skills.length }})</v-label>
                                    <div v-if="skills.length === 0" class="no-skills-message">
                                        <v-icon class="mr-2">mdi-information-outline</v-icon>
                                        No hay habilidades agregadas. Añade al menos una habilidad requerida.
                                    </div>
                                    <div v-else class="skills-chip-container">
                                        <v-chip
                                            v-for="(skill, index) in skills"
                                            :key="index"
                                            closable
                                            @click:close="removeSkill(index)"
                                            color="primary"
                                            variant="tonal"
                                            size="default"
                                            class="skill-chip-modern"
                                        >
                                            {{ skill }}
                                        </v-chip>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </div>

                    <!-- Botones de acción -->
                    <div class="form-actions-modern">
                        <v-btn 
                            flat 
                            variant="tonal" 
                            to="/vacancies/list-all" 
                            size="large"
                            class="cancel-btn-modern"
                        >
                            <v-icon start>mdi-close</v-icon>
                            Cancelar
                        </v-btn>
                        <v-btn 
                            :disabled="!valid" 
                            color="primary" 
                            @click="submitVacant" 
                            size="large"
                            class="submit-btn-modern"
                        >
                            <v-icon start>mdi-check</v-icon>
                            Crear Vacante
                        </v-btn>
                    </div>
                </v-form>
            </v-card-item>
        </v-card>
    </div>
</template>

<style lang="scss">
.create-vacant-page-modern {
    width: 100%;
    animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.create-vacant-card-modern {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.card-header-modern {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    padding: 32px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.header-icon-wrapper {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.header-text {
    flex: 1;
}

.page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.company-info {
    font-size: 1rem;
    color: #64748b;
    display: flex;
    align-items: center;
    margin: 0;
}

.alert-modern {
    border-radius: 12px;
    border-left: 4px solid;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.vacant-form-modern {
    width: 100%;
}

.form-section-modern {
    margin-bottom: 32px;
    padding: 24px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(168, 85, 247, 0.02) 100%);
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgba(99, 102, 241, 0.1);
}

.section-icon {
    font-size: 28px;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.form-field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
}

.form-input-modern :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.form-input-modern :deep(.v-field--focused) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.form-input-modern :deep(.v-field__input) {
    padding: 12px 16px;
    font-size: 0.95rem;
}

.form-input-modern :deep(.v-field__prepend-inner) {
    padding-right: 12px;
    color: rgb(99, 102, 241);
}

.add-skill-btn {
    transition: all 0.2s ease;
}

.add-skill-btn:hover:not(:disabled) {
    transform: scale(1.1);
}

.editor-wrapper-modern {
    margin-top: 16px;
}

.editor-card-modern {
    border-radius: 12px;
    overflow: hidden;
    background: white;
}

.editor-content-wrapper {
    padding: 16px;
    min-height: 200px;
}

.skills-display-section {
    width: 100%;
}

.no-skills-message {
    padding: 20px;
    background: rgba(99, 102, 241, 0.05);
    border-radius: 12px;
    border: 2px dashed rgba(99, 102, 241, 0.2);
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.skills-chip-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
    padding: 8px;
}

.skill-chip-modern {
    font-weight: 600;
    transition: all 0.2s ease;
    border-radius: 8px;
}

.skill-chip-modern:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.form-actions-modern {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 2px solid rgba(99, 102, 241, 0.1);
}

.cancel-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    padding: 12px 24px;
}

.submit-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    padding: 12px 32px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.submit-btn-modern:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.submit-btn-modern:active:not(:disabled) {
    transform: translateY(0);
}

.submit-btn-modern:disabled {
    opacity: 0.6;
    box-shadow: none;
}

@media (max-width: 960px) {
    .header-content {
        flex-direction: column;
        text-align: center;
    }
    
    .card-header-modern {
        padding: 24px;
    }
    
    .form-section-modern {
        padding: 16px;
    }
    
    .form-actions-modern {
        flex-direction: column-reverse;
    }
    
    .cancel-btn-modern,
    .submit-btn-modern {
        width: 100%;
    }
}
</style>
