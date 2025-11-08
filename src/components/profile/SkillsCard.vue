<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const route = useRoute();
const authStore = useAuthStore();
const loggedInUserId = authStore.userId?.toString() || undefined;
const userId = ref<any | undefined>(undefined);
userId.value = route.params.id || loggedInUserId;
const isOwnProfile = userId.value === loggedInUserId;

// Getting email of the user
const email = ref('');
const profileIntroduction = ref('');
const profileLocation = ref('');
const profileUniversity = ref('');
const profilePhone = ref('');
const profileId = ref('');

const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${userId.value}`);
        const userData = response.data;
        email.value = userData.email;
        profileId.value = userData.profile.id;
        await fetchProfileData(); // Fetch profile data after fetching user data
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${profileId.value}`);
        const profileData = response.data;
        profileIntroduction.value = profileData.aboutMe;
        profileLocation.value = profileData.location;
        profileUniversity.value = profileData.university;
        profilePhone.value = profileData.phone;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

const dialog = ref(false);

onMounted(async () => {
    await fetchUserData(); // Fetch user data when the component is mounted
});

watch(() => route.params.id, async (newUserId) => {
    userId.value = newUserId || loggedInUserId;
    await fetchUserData();
});

function close() {
    dialog.value = false;
}

// Interfaces
interface Skill {
  id?: string;
  name: string;
  level?: number;
  endorsements?: number;
  category?: string;
  verified?: boolean;
}

// Variables para skills
const skills = ref<Skill[]>([]);
const newSkill = ref('');
const isSavingSkills = ref(false);

// Filtros
const searchTerm = ref('');

// Cargar skills usando el endpoint específico
const fetchSkills = async () => {
  try {
    if (!profileId.value) return;
    
    const response = await axios.get(`http://localhost:3000/profiles/skills/${profileId.value}`);
    
    if (Array.isArray(response.data)) {
      skills.value = response.data;
    } else if (typeof response.data === 'string' && response.data) {
      // Si el backend devuelve un string, convertirlo a array de skills
      const skillNames = response.data.split(',').map(s => s.trim());
      skills.value = skillNames.map(name => ({ name }));
    } else {
      skills.value = [];
    }
  } catch (error) {
    console.error('Error al cargar skills:', error);
    skills.value = [];
  }
};

// Añadir skill
const addSkill = () => {
  if (newSkill.value.trim() && !skills.value.some(s => s.name.toLowerCase() === newSkill.value.toLowerCase())) {
    const skillToAdd = {
      name: newSkill.value.trim(),
      level: 1,
      endorsements: 0
    };
    
    skills.value.push(skillToAdd);
    updateSkill(skillToAdd);
    newSkill.value = '';
  }
};

// Actualizar una skill específica usando el endpoint de actualización
const updateSkill = async (skill: Skill) => {
  if (!profileId.value || loggedInUserId !== userId.value) return;
  
  isSavingSkills.value = true;
  
  try {
    await axios.patch(`http://localhost:3000/profiles/update-skills/${profileId.value}`, {
      skillName: skill.name,
      level: skill.level
    });
  } catch (error) {
    console.error('Error al actualizar skill:', error);
    // Si falla, mostrar mensaje y recargar las skills
    alert('Error al guardar la habilidad. Por favor, intenta nuevamente.');
    await fetchSkills();
  } finally {
    isSavingSkills.value = false;
  }
};

// Eliminar skill usando el endpoint específico para eliminar
const removeSkill = async (skillToRemove: Skill) => {
  if (!profileId.value || loggedInUserId !== userId.value) return;
  
  isSavingSkills.value = true;
  
  try {
    // Obtenemos las habilidades actuales sin la que queremos eliminar
    const updatedSkills = skills.value.filter(skill => skill.name !== skillToRemove.name);
    const skillNames = updatedSkills.map(s => s.name);
    
    // Usamos el endpoint de actualización en lugar del de eliminación específica
    await axios.patch(`http://localhost:3000/profiles/update-skills/${profileId.value}`, {
      skills: skillNames.join(', ')
    });
    
    // Actualizar lista local
    skills.value = updatedSkills;
    //console.log('Habilidad eliminada exitosamente');
  } catch (error) {
    console.error('Error al eliminar skill:', error);
    alert('Error al eliminar la habilidad. Por favor, intenta nuevamente.');
  } finally {
    isSavingSkills.value = false;
  }
};

// Guardar todas las skills en el backend
const saveSkills = async () => {
  if (!profileId.value || loggedInUserId !== userId.value) return;
  
  isSavingSkills.value = true;
  
  try {
    // Obtener solo los nombres para enviar al backend
    const skillNames = skills.value.map(s => s.name);
    
    await axios.patch(`http://localhost:3000/profiles/update-skills/${profileId.value}`, {
      skills: skillNames.join(', ')
    });
    
    dialog.value = false;
    alert('Habilidades guardadas exitosamente');
  } catch (error) {
    console.error('Error al guardar skills:', error);
    alert('Error al guardar las habilidades. Por favor, intenta nuevamente.');
  } finally {
    isSavingSkills.value = false;
  }
};

// Filtrar skills por término de búsqueda
const filteredSkills = computed(() => {
  let result = skills.value;
  
  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase();
    result = result.filter(skill => skill.name.toLowerCase().includes(search));
  }
  
  return result;
});

// Cargar skills al montar el componente
onMounted(async () => {
  await fetchUserData();
  await fetchSkills();
});
</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined" class="skills-card" rounded="lg">
                <v-card-item class="pa-6">
                    <div class="d-flex justify-space-between align-center mb-4">
                        <div class="d-flex align-center gap-2">
                            <div class="card-icon-wrapper">
                                <Icon icon="mdi:lightbulb-on-outline" height="24" class="card-icon" />
                            </div>
                            <h4 class="text-h5 font-weight-bold mb-0">Habilidades</h4>
                        </div>
                        <v-dialog v-model="dialog" max-width="600">
                            <template v-slot:activator="{ props }">
                                <v-btn v-if="isOwnProfile" color="success" v-bind="props" size="small" variant="flat" class="edit-btn">
                                    <Icon icon="solar:pen-linear" height="18" class="mr-1" />
                                    Editar
                                </v-btn>
                            </template>
                            <v-card rounded="lg">
                                <v-card-title class="pa-4 bg-primary">
                                    <span class="title text-white">Gestionar Habilidades</span>
                                </v-card-title>

                                <v-card-text class="pa-4">
                                    <v-row>
                                        <v-col cols="12">
                                            <v-text-field
                                                v-model="newSkill"
                                                label="Añadir nueva habilidad"
                                                placeholder="Ej: JavaScript, Diseño UX, Marketing Digital"
                                                variant="outlined"
                                                hide-details="auto"
                                                class="mb-4"
                                                @keyup.enter="addSkill"
                                            >
                                                <template v-slot:append>
                                                    <v-btn
                                                        color="success"
                                                        variant="text"
                                                        icon="mdi-plus"
                                                        :disabled="!newSkill.trim()"
                                                        @click="addSkill"
                                                    ></v-btn>
                                                </template>
                                            </v-text-field>
                                        </v-col>

                                        <v-col cols="12">
                                            <div class="text-subtitle-1 mb-3 font-weight-medium">Mis habilidades</div>
                                            <div class="skills-edit-container">
                                                <v-chip
                                                    v-for="skill in filteredSkills"
                                                    :key="skill.name"
                                                    closable
                                                    @click:close="removeSkill(skill)"
                                                    color="primary"
                                                    variant="tonal"
                                                    class="ma-1 skill-chip-edit"
                                                    size="small"
                                                >
                                                    {{ skill.name }}
                                                </v-chip>
                                            </div>

                                            <v-alert
                                                v-if="filteredSkills.length === 0"
                                                type="info"
                                                variant="tonal"
                                                class="mt-3"
                                                rounded="lg"
                                            >
                                                No tienes habilidades añadidas. ¡Añade algunas!
                                            </v-alert>
                                        </v-col>
                                    </v-row>
                                </v-card-text>

                                <v-card-actions class="pa-4">
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="flat" @click="close">Cancelar</v-btn>
                                    <v-btn color="primary" variant="flat" @click="saveSkills">Guardar</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>

                    <!-- Visualización de habilidades -->
                    <div class="skills-container">
                        <div v-if="skills.length > 0" class="skills-display">
                            <v-chip
                                v-for="skill in skills"
                                :key="skill.name"
                                color="primary"
                                variant="tonal"
                                class="skill-chip-display"
                                size="small"
                            >
                                {{ skill.name }}
                            </v-chip>
                        </div>
                        <v-alert
                            v-else
                            type="info"
                            variant="tonal"
                            class="mt-3 empty-skills-alert"
                            rounded="lg"
                        >
                            {{ isOwnProfile ? 'Aún no has añadido habilidades. ¡Añade algunas para destacar tu perfil!' : 'Este usuario aún no ha añadido habilidades.' }}
                        </v-alert>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped>
.skills-card {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    overflow: hidden;
}

.skills-card:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.card-icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 152, 0, 0.1) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.card-icon {
    color: rgb(255, 193, 7);
}

.edit-btn {
    border-radius: 8px;
    text-transform: none;
    font-weight: 500;
}

.skills-container {
    width: 100%;
}

.skills-display {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0;
}

.skill-chip-display {
    font-size: 13px;
    font-weight: 500;
    height: 32px !important;
    border-radius: 16px !important;
    padding: 0 16px !important;
    transition: all 0.2s ease;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%) !important;
    color: rgb(99, 102, 241) !important;
    border: 1px solid rgba(99, 102, 241, 0.2) !important;
}

.skill-chip-display:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%) !important;
}

.skills-edit-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px;
    background: rgba(99, 102, 241, 0.02);
    border-radius: 12px;
    min-height: 60px;
}

.skill-chip-edit {
    font-size: 13px;
    font-weight: 500;
    height: 32px !important;
    border-radius: 16px !important;
    transition: all 0.2s ease;
}

.skill-chip-edit:hover {
    transform: scale(1.05);
}

.empty-skills-alert {
    border-left: 3px solid rgb(33, 150, 243);
}

@media (max-width: 600px) {
    .skills-card {
        border-radius: 12px !important;
    }
    
    .skill-chip-display {
        font-size: 12px;
        height: 28px !important;
        padding: 0 12px !important;
    }
}
</style>