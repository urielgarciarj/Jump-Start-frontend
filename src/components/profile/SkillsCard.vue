<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { PhoneIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const loggedInUserId = ref(authStore.userId);
const userId = ref(route.params.userId || loggedInUserId.value);

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

const valid = ref(true);
const dialog = ref(false);

onMounted(async () => {
    await fetchUserData(); // Fetch user data when the component is mounted
});

watch(() => route.params.userId, async (newUserId) => {
    userId.value = newUserId || loggedInUserId.value;
    await fetchUserData();
});

function close() {
    dialog.value = false;
}

function save() {
    close();
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
  if (!profileId.value || loggedInUserId.value !== userId.value) return;
  
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
  if (!profileId.value || loggedInUserId.value !== userId.value) return;
  
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
    console.log('Habilidad eliminada exitosamente');
  } catch (error) {
    console.error('Error al eliminar skill:', error);
    alert('Error al eliminar la habilidad. Por favor, intenta nuevamente.');
  } finally {
    isSavingSkills.value = false;
  }
};

// Guardar todas las skills en el backend
const saveSkills = async () => {
  if (!profileId.value || loggedInUserId.value !== userId.value) return;
  
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
            <v-card variant="outlined">
                <v-card-item>
                    <div class="d-flex justify-space-between align-center mb-4">
                        <h4 class="text-h4">Habilidades</h4>
                        <v-dialog v-model="dialog" max-width="600">
                            <template v-slot:activator="{ props }">
                                <v-btn v-if="loggedInUserId === userId" color="lightsuccess" v-bind="props" size="29">
                                    <Icon icon="solar:pen-linear" class="text-success" height="15" />
                                    <v-tooltip location="bottom">Editar</v-tooltip>
                                </v-btn>
                            </template>
                            <v-card>
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
                                            <div class="text-subtitle-1 mb-2">Mis habilidades</div>
                                            <v-chip-group>
                                                <v-chip
                                                    v-for="skill in filteredSkills"
                                                    :key="skill.name"
                                                    closable
                                                    @click:close="removeSkill(skill)"
                                                    color="primary"
                                                    variant="outlined"
                                                    class="ma-1"
                                                >
                                                    {{ skill.name }}
                                                </v-chip>
                                            </v-chip-group>

                                            <v-alert
                                                v-if="filteredSkills.length === 0"
                                                type="info"
                                                variant="tonal"
                                                class="mt-3"
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
                    <div class="skills-container mt-2">
                        <div v-if="skills.length > 0" class="mb-4">
                            <v-chip-group class="skills-chip-group">
                                <v-chip
                                    v-for="skill in skills"
                                    :key="skill.name"
                                    color="primary"
                                    variant="tonal"
                                    class="ma-1 skill-chip"
                                >
                                    {{ skill.name }}
                                </v-chip>
                            </v-chip-group>
                        </div>
                        <v-alert
                            v-else
                            type="info"
                            variant="tonal"
                            class="mt-3 mb-6"
                        >
                            {{ loggedInUserId === userId ? 'Aún no has añadido habilidades. ¡Añade algunas para destacar tu perfil!' : 'Este usuario aún no ha añadido habilidades.' }}
                        </v-alert>
                    </div>

                    <v-divider class="mb-4"></v-divider>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>

<style scoped>
.skills-container {
  margin-top: 16px;
  width: 100%;
}

.skills-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

.skill-chip {
  font-size: 14px;
  font-weight: 500;
  margin: 4px !important;
  height: 32px !important;
  border-radius: 16px !important;
}
</style>