<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { MailIcon, MapPinIcon, SchoolIcon, BriefcaseIcon } from 'vue-tabler-icons';
import UserImage from '@/assets/images/profile/user-5.jpg';

const router = useRouter();

const props = defineProps({
    student: {
        type: Object,
        required: true
    }
});

const profileData = ref<any>(null);
const userData = ref<any>(null);
const isLoading = ref(false);

// Obtener datos del perfil y usuario
const fetchStudentData = async () => {
    try {
        isLoading.value = true;
        // El endpoint puede devolver userId o id del perfil
        const userId = props.student.userId || props.student.id;
        
        if (!userId) {
            console.error('No se encontró userId en los datos del estudiante');
            return;
        }
        
        // Obtener datos del usuario
        const userResponse = await axios.get(`http://localhost:3000/users/user/${userId}`);
        userData.value = userResponse.data;
        
        // Obtener datos del perfil directamente con userId (como se hace en ProfileBanner)
        try {
            const profileResponse = await axios.get(`http://localhost:3000/profiles/${userId}`);
            profileData.value = profileResponse.data;
        } catch (profileError) {
            // Si falla, intentar con el profile.id del usuario
            if (userData.value?.profile?.id) {
                const profileResponse = await axios.get(`http://localhost:3000/profiles/${userData.value.profile.id}`);
                profileData.value = profileResponse.data;
            }
        }
    } catch (error) {
        console.error('Error al obtener datos del estudiante:', error);
    } finally {
        isLoading.value = false;
    }
};

// Formatear skills
const formatSkills = (skills: string) => {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
};

const skills = ref<string[]>([]);

onMounted(async () => {
    // Si el estudiante ya tiene skills, usarlas directamente
    if (props.student.skills) {
        skills.value = formatSkills(props.student.skills);
    }
    await fetchStudentData();
    // Si después de obtener los datos hay skills en el perfil, actualizar
    if (profileData.value?.skills && skills.value.length === 0) {
        skills.value = formatSkills(profileData.value.skills);
    }
});

const navigateToProfile = () => {
    const userId = props.student.userId || props.student.id;
    if (userId) {
        router.push(`/profile/${userId}`);
    }
};
</script>

<template>
    <v-card 
        class="student-card-modern" 
        elevation="0"
        @click="navigateToProfile"
    >
        <v-card-item class="pa-6">
            <!-- Header con foto de perfil y nombre -->
            <div class="student-header mb-4">
                <div class="student-avatar-wrapper">
                    <v-avatar 
                        :size="80" 
                        class="student-avatar"
                    >
                        <img 
                            v-if="profileData?.picture || props.student.picture" 
                            :src="profileData?.picture || props.student.picture" 
                            alt="Foto de perfil"
                            class="avatar-image"
                        />
                        <img 
                            v-else
                            :src="UserImage" 
                            alt="Foto de perfil"
                            class="avatar-image"
                        />
                    </v-avatar>
                    <div class="online-indicator"></div>
                </div>
                <div class="student-info-header">
                    <h3 class="student-name">
                        {{ userData?.name || 'Estudiante' }} {{ userData?.lastName || '' }}
                    </h3>
                    <p class="student-email">
                        <MailIcon size="16" class="mr-1" />
                        {{ userData?.email || 'No disponible' }}
                    </p>
                </div>
            </div>

            <v-divider class="mb-4"></v-divider>

            <!-- Información adicional -->
            <div class="student-details mb-4">
                <div v-if="profileData?.location" class="detail-row">
                    <div class="detail-icon">
                        <MapPinIcon size="18" />
                    </div>
                    <span class="detail-text">{{ profileData.location }}</span>
                </div>
                
                <div v-if="profileData?.university" class="detail-row">
                    <div class="detail-icon">
                        <SchoolIcon size="18" />
                    </div>
                    <span class="detail-text">{{ profileData.university }}</span>
                </div>
                
                <div v-if="profileData?.jobCompany" class="detail-row">
                    <div class="detail-icon">
                        <BriefcaseIcon size="18" />
                    </div>
                    <span class="detail-text">{{ profileData.jobCompany }}</span>
                </div>
            </div>

            <!-- Skills -->
            <div v-if="skills.length > 0" class="skills-section">
                <div class="skills-header">
                    <Icon icon="mdi:code-tags" height="20" class="skills-icon" />
                    <span class="skills-title">Habilidades</span>
                </div>
                <div class="skills-chips">
                    <v-chip
                        v-for="(skill, index) in skills.slice(0, 8)"
                        :key="index"
                        color="primary"
                        variant="tonal"
                        size="small"
                        class="skill-chip"
                    >
                        {{ skill }}
                    </v-chip>
                    <v-chip
                        v-if="skills.length > 8"
                        color="primary"
                        variant="outlined"
                        size="small"
                        class="skill-chip"
                    >
                        +{{ skills.length - 8 }} más
                    </v-chip>
                </div>
            </div>
            <div v-else class="no-skills">
                <span class="text-caption text-medium-emphasis">Sin habilidades registradas</span>
            </div>

            <!-- Botón de acción -->
            <div class="action-section mt-4">
                <v-btn
                    color="primary"
                    variant="flat"
                    block
                    class="view-profile-btn"
                    :disabled="isLoading || !(props.student.userId || props.student.id)"
                    @click.stop="navigateToProfile"
                >
                    <v-progress-circular
                        v-if="isLoading"
                        indeterminate
                        color="white"
                        size="16"
                        width="2"
                        class="mr-2"
                    ></v-progress-circular>
                    <Icon v-else icon="mdi:account-eye" height="18" class="mr-2" />
                    {{ isLoading ? 'Cargando...' : 'Ver Perfil Completo' }}
                </v-btn>
            </div>
        </v-card-item>
    </v-card>
</template>

<style scoped lang="scss">
.student-card-modern {
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.08);
    cursor: pointer;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.student-card-modern:hover {
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
    transform: translateY(-4px);
    border-color: rgba(99, 102, 241, 0.3);
}

.student-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.student-avatar-wrapper {
    position: relative;
    flex-shrink: 0;
}

.student-avatar {
    border: 3px solid rgba(99, 102, 241, 0.2);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    overflow: hidden;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
}

.online-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 16px;
    height: 16px;
    background: #4caf50;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.student-info-header {
    flex: 1;
    min-width: 0;
}

.student-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
    line-height: 1.3;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.student-email {
    font-size: 0.85rem;
    color: #64748b;
    display: flex;
    align-items: center;
    margin: 0;
}

.student-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);
    border-radius: 8px;
    transition: all 0.2s ease;
}

.detail-row:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    transform: translateX(4px);
}

.detail-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
    color: rgb(99, 102, 241);
    flex-shrink: 0;
}

.detail-text {
    font-size: 0.9rem;
    color: #475569;
    font-weight: 500;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.skills-section {
    margin-top: 8px;
}

.skills-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.skills-icon {
    color: rgb(99, 102, 241);
}

.skills-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
}

.skills-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.skill-chip {
    font-weight: 500;
    transition: all 0.2s ease;
}

.skill-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(99, 102, 241, 0.2);
}

.no-skills {
    padding: 12px;
    text-align: center;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
}

.action-section {
    margin-top: auto;
}

.view-profile-btn {
    border-radius: 10px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.3px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.view-profile-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.view-profile-btn:active {
    transform: translateY(0);
}

@media (max-width: 600px) {
    .student-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .student-info-header {
        text-align: center;
    }
}
</style>

