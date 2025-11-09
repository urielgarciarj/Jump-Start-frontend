<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import StudentCard from '@/components/students/StudentCard.vue';
import axios, { AxiosError } from 'axios';
import { Icon } from '@iconify/vue';

const page = ref({ title: 'Buscar Estudiantes' });
const breadcrumbs = ref([
    { text: 'Dashboard', disabled: false, href: '#' },
    { text: 'Buscar Estudiantes', disabled: true, href: '#' }
]);

const searchInput = ref('');
const selectedSkills = ref<string[]>([]);
const students = ref<any[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const hasSearched = ref(false);

// Skills comunes sugeridas
const suggestedSkills = ref([
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure',
    'Express.js', 'NestJS', 'Django', 'Flask', 'Spring Boot',
    'GraphQL', 'REST API', 'Microservicios', 'CI/CD'
]);

// Agregar skill desde el input
const addSkill = () => {
    const skill = searchInput.value.trim();
    if (skill && !selectedSkills.value.includes(skill)) {
        selectedSkills.value.push(skill);
        searchInput.value = '';
    }
};

// Agregar skill desde sugerencias
const addSkillFromSuggestion = (skill: string) => {
    if (!selectedSkills.value.includes(skill)) {
        selectedSkills.value.push(skill);
    }
};

// Eliminar skill
const removeSkill = (skill: string) => {
    selectedSkills.value = selectedSkills.value.filter(s => s !== skill);
};

// Limpiar todas las skills
const clearAllSkills = () => {
    selectedSkills.value = [];
    students.value = [];
    hasSearched.value = false;
    error.value = null;
};

// Buscar estudiantes
const searchStudents = async () => {
    if (selectedSkills.value.length === 0) {
        error.value = 'Por favor, agrega al menos una habilidad para buscar.';
        return;
    }

    try {
        isLoading.value = true;
        error.value = null;
        hasSearched.value = true;

        const response = await axios.post('http://localhost:3000/profiles/search-by-skills', {
            skills: selectedSkills.value
        });

        students.value = response.data || [];
        
        if (students.value.length === 0) {
            error.value = 'No se encontraron estudiantes con las habilidades especificadas.';
        }
    } catch (err) {
        console.error('Error al buscar estudiantes:', err);
        const errorAxios = err as AxiosError;
        if (errorAxios.response) {
            error.value = 'Ocurrió un error al buscar estudiantes. Intenta nuevamente.';
        } else {
            error.value = 'Error de conexión. Verifica tu conexión a internet.';
        }
        students.value = [];
    } finally {
        isLoading.value = false;
    }
};

// Manejar Enter en el input
const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        addSkill();
    }
};

// Filtrar sugerencias basadas en el input
const filteredSuggestions = computed(() => {
    if (!searchInput.value) return suggestedSkills.value.slice(0, 10);
    const query = searchInput.value.toLowerCase();
    return suggestedSkills.value
        .filter(skill => 
            skill.toLowerCase().includes(query) && 
            !selectedSkills.value.includes(skill)
        )
        .slice(0, 10);
});
</script>

<template>
    <div class="search-students-page">
        <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

        <!-- Header con búsqueda -->
        <v-card class="search-header-modern mb-6" elevation="0">
            <v-card-item class="pa-6">
                <div class="search-header-content">
                    <div class="header-title-section mb-4">
                        <div class="title-icon-wrapper">
                            <Icon icon="mdi:account-search" height="32" class="title-icon" />
                        </div>
                        <div>
                            <h2 class="page-title">Buscar Estudiantes por Habilidades</h2>
                            <p class="page-subtitle">Encuentra estudiantes que coincidan con las habilidades que necesitas</p>
                        </div>
                    </div>

                    <!-- Input de búsqueda -->
                    <div class="search-input-section mb-4">
                        <v-text-field
                            v-model="searchInput"
                            variant="outlined"
                            prepend-inner-icon="mdi-tag-outline"
                            placeholder="Escribe una habilidad y presiona Enter..."
                            hide-details
                            density="comfortable"
                            color="primary"
                            class="skill-input-modern"
                            @keypress="handleKeyPress"
                            autocomplete="off"
                        >
                            <template v-slot:append-inner>
                                <v-btn
                                    icon
                                    size="small"
                                    variant="text"
                                    color="primary"
                                    @click="addSkill"
                                    :disabled="!searchInput.trim()"
                                >
                                    <Icon icon="mdi:plus-circle" height="24" />
                                </v-btn>
                            </template>
                        </v-text-field>

                        <!-- Sugerencias de skills -->
                        <div v-if="searchInput && filteredSuggestions.length > 0" class="suggestions-dropdown">
                            <div class="suggestions-header">
                                <Icon icon="mdi:lightbulb-on-outline" height="18" class="mr-2" />
                                <span class="text-caption font-weight-medium">Sugerencias</span>
                            </div>
                            <div class="suggestions-list">
                                <v-chip
                                    v-for="skill in filteredSuggestions"
                                    :key="skill"
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                    class="suggestion-chip"
                                    @click="addSkillFromSuggestion(skill)"
                                >
                                    <Icon icon="mdi:plus" height="16" class="mr-1" />
                                    {{ skill }}
                                </v-chip>
                            </div>
                        </div>
                    </div>

                    <!-- Skills seleccionadas -->
                    <div v-if="selectedSkills.length > 0" class="selected-skills-section mb-4">
                        <div class="skills-header-row">
                            <span class="skills-label">
                                <Icon icon="mdi:tag-multiple" height="18" class="mr-1" />
                                Habilidades seleccionadas ({{ selectedSkills.length }})
                            </span>
                            <v-btn
                                size="small"
                                variant="text"
                                color="error"
                                @click="clearAllSkills"
                                class="clear-btn"
                            >
                                <Icon icon="mdi:delete-sweep" height="18" class="mr-1" />
                                Limpiar todo
                            </v-btn>
                        </div>
                        <div class="selected-skills-chips">
                            <v-chip
                                v-for="skill in selectedSkills"
                                :key="skill"
                                color="primary"
                                variant="flat"
                                size="default"
                                class="selected-skill-chip"
                                closable
                                @click:close="removeSkill(skill)"
                            >
                                <Icon icon="mdi:tag" height="16" class="mr-1" />
                                {{ skill }}
                            </v-chip>
                        </div>
                    </div>

                    <!-- Botón de búsqueda -->
                    <div class="search-actions">
                        <v-btn
                            color="primary"
                            size="x-large"
                            @click="searchStudents"
                            :disabled="selectedSkills.length === 0 || isLoading"
                            class="search-btn-modern"
                            block
                        >
                            <Icon icon="mdi:magnify" height="24" class="mr-2" />
                            {{ isLoading ? 'Buscando...' : 'Buscar Estudiantes' }}
                            <template v-slot:prepend>
                                <v-progress-circular
                                    v-if="isLoading"
                                    indeterminate
                                    color="white"
                                    size="20"
                                    width="2"
                                ></v-progress-circular>
                            </template>
                        </v-btn>
                    </div>
                </div>
            </v-card-item>
        </v-card>

        <!-- Mensajes de error -->
        <v-alert
            v-if="error"
            type="warning"
            variant="tonal"
            class="mb-4 alert-modern"
            border="start"
            dismissible
            @update:model-value="error = null"
        >
            <template v-slot:prepend>
                <Icon icon="mdi:alert-circle-outline" height="24" />
            </template>
            <div class="text-h6 mb-1">Atención</div>
            <div>{{ error }}</div>
        </v-alert>

        <!-- Indicador de carga -->
        <v-overlay v-if="isLoading" :value="isLoading" class="align-center justify-center">
            <div class="loading-container">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
                <p class="mt-4 text-h6">Buscando estudiantes...</p>
            </div>
        </v-overlay>

        <!-- Resultados -->
        <div v-if="hasSearched && !isLoading" class="results-section">
            <div class="results-header mb-4">
                <h3 class="results-title">
                    <Icon icon="mdi:account-group" height="28" class="mr-2" />
                    Resultados de la búsqueda
                    <v-chip color="primary" variant="flat" size="small" class="ml-3">
                        {{ students.length }} {{ students.length === 1 ? 'estudiante encontrado' : 'estudiantes encontrados' }}
                    </v-chip>
                </h3>
            </div>

            <!-- Grid de estudiantes -->
            <div v-if="students.length > 0" class="students-grid">
                <StudentCard
                    v-for="student in students"
                    :key="student.userId"
                    :student="student"
                />
            </div>

            <!-- Mensaje cuando no hay resultados -->
            <v-alert
                v-if="students.length === 0 && !error"
                type="info"
                variant="tonal"
                class="no-results-alert"
                border="start"
            >
                <template v-slot:prepend>
                    <Icon icon="mdi:information-outline" height="24" />
                </template>
                <div class="text-h6 mb-2">No se encontraron estudiantes</div>
                <div>Intenta buscar con diferentes habilidades o verifica la ortografía.</div>
            </v-alert>
        </div>

        <!-- Mensaje inicial -->
        <v-card
            v-if="!hasSearched && !isLoading"
            class="welcome-card-modern"
            elevation="0"
        >
            <v-card-item class="pa-8 text-center">
                <div class="welcome-icon-wrapper mb-4">
                    <Icon icon="mdi:account-search-outline" height="64" class="welcome-icon" />
                </div>
                <h3 class="welcome-title mb-2">Comienza tu búsqueda</h3>
                <p class="welcome-text">
                    Agrega habilidades en el campo de búsqueda para encontrar estudiantes que coincidan con tus necesidades.
                </p>
            </v-card-item>
        </v-card>
    </div>
</template>

<style scoped lang="scss">
.search-students-page {
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

.search-header-modern {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-radius: 16px;
    border: 1px solid rgba(99, 102, 241, 0.1);
    transition: all 0.3s ease;
}

.search-header-modern:hover {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.search-header-content {
    width: 100%;
}

.header-title-section {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.title-icon-wrapper {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.title-icon {
    color: rgb(99, 102, 241);
}

.page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.page-subtitle {
    font-size: 1rem;
    color: #64748b;
    margin: 4px 0 0 0;
}

.search-input-section {
    position: relative;
}

.skill-input-modern :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.skill-input-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.skill-input-modern :deep(.v-field--focused) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.suggestions-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 8px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    z-index: 10;
    padding: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.suggestions-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #64748b;
    font-size: 0.75rem;
}

.suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.suggestion-chip {
    cursor: pointer;
    transition: all 0.2s ease;
}

.suggestion-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.selected-skills-section {
    padding: 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
}

.skills-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.skills-label {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: #1e293b;
    font-size: 0.9rem;
}

.clear-btn {
    text-transform: none;
    font-weight: 500;
}

.selected-skills-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.selected-skill-chip {
    font-weight: 600;
    transition: all 0.2s ease;
}

.selected-skill-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.search-actions {
    margin-top: 8px;
}

.search-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.search-btn-modern:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.search-btn-modern:active:not(:disabled) {
    transform: translateY(0);
}

.search-btn-modern:disabled {
    opacity: 0.6;
    box-shadow: none;
}

.alert-modern {
    border-radius: 12px;
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

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgb(99, 102, 241);
}

.results-section {
    animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.results-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    margin: 0;
}

.students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

.no-results-alert {
    border-radius: 12px;
    margin-top: 24px;
}

.welcome-card-modern {
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(168, 85, 247, 0.03) 100%);
    border: 2px dashed rgba(99, 102, 241, 0.2);
}

.welcome-icon-wrapper {
    display: inline-flex;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.welcome-icon {
    color: rgb(99, 102, 241);
}

.welcome-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.welcome-text {
    font-size: 1rem;
    color: #64748b;
    max-width: 600px;
    margin: 0 auto;
}

@media (max-width: 960px) {
    .students-grid {
        grid-template-columns: 1fr;
    }
    
    .header-title-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .search-header-modern :deep(.v-card-item) {
        padding: 20px !important;
    }
}
</style>

