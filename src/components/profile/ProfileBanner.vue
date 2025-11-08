<script setup lang="ts">
import { ref, shallowRef, onMounted, watch, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { UserIcon, ArchiveIcon, FileStarIcon, FileCvIcon } from 'vue-tabler-icons';
import { Icon } from '@iconify/vue';
import axios from 'axios';
// Components
import profileBg from '@/assets/images/backgrounds/profilebg.jpg';
import UserImage from '@/assets/images/profile/user-5.jpg';
import { VLazy } from 'vuetify/lib/components/index.mjs';

const props = defineProps({
    userId: String
});
const authStore = useAuthStore();
const loggedInUserId = authStore.userId;
const isOwnProfile = props.userId == loggedInUserId;
const tab = ref(null);
const items = shallowRef([
    { tab: 'Perfil', icon: UserIcon, href: `/profile/${props.userId}` }
]);

// Getting full name of the user
const fullName = ref('');
const role = ref('');

// Getting profile picture from profile of the user
const profilePicture = ref('');

// social media links
const isEditing = ref(false);
const showSuccessPopup = ref(false);
const socialLinks = ref({
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
})
const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${props.userId}`);
        const userData = response.data;
        fullName.value = `${userData.name} ${userData.lastName}`;
        role.value = userData.role;
        socialLinks.value = userData.socialLinks || {};
        updateTabs(userData.role);
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${props.userId}`);
        const profileData = response.data;
        profilePicture.value = profileData.picture;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

// Guardar cambios en redes sociales
const saveSocialLinks = async () => {
    try {
        await axios.put(`http://localhost:3000/profiles/update-social-links/${props.userId}`, socialLinks.value);
        isEditing.value = false;
    } catch (error) {
        console.error('Error saving social links:', error);
    }
};

const onFileChange = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target && target.files) {
        const file = target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post(`http://localhost:3000/profiles/upload-profile-picture/${loggedInUserId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                profilePicture.value = response.data.fileUrl; // Actualiza la imagen mostrada
                //console.log('Image uploaded:', profilePicture.value);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    }
};

const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileInput = () => {
    fileInput.value?.click();
};

onMounted(() => {
    fetchUserData();
    fetchProfileData();
});

// Updates available tabs based on user role
const updateTabs = (role: String) => {
    try {
        if (!role) return;
        items.value = [{ tab: 'Perfil', icon: UserIcon, href: `/profile/${props.userId}` }];
        switch (role.toLowerCase()) {
            case 'docente':
                items.value.push({ tab: 'Proyectos', icon: FileStarIcon, href: '/myprojects/' + props.userId });
                break;
            case 'reclutador':
                items.value.push({ tab: 'Ofertas laborales', icon: ArchiveIcon, href: '/userapplications/' + props.userId });
                break;
            case 'estudiante':
                items.value.push({ tab: 'CV', icon: FileCvIcon, href: '/cv/' + props.userId });
                items.value.push({ tab: 'Proyectos', icon: FileStarIcon, href: '/myprojects/' + props.userId });
                if (props.userId == loggedInUserId) {// Just the owner estudent can view the vacants where he send an apply
                    items.value.push({ tab: 'Ofertas laborales', icon: ArchiveIcon, href: '/userapplications/' + props.userId });
                }
                break;
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};
</script>

<template>
    <v-card elevation="0" class="overflow-hidden profile-banner-card">
        <div class="banner-gradient">
            <img :src="profileBg" alt="profile" class="w-100 banner-image" height="180px" />
        </div>
        <div class="banner-content">
            <v-row class="mt-1">
                <v-col cols="12" lg="4" sm="12" class="order-sm-second">
                    <div class="px-4 py-1">
                    </div>
                </v-col>
                <v-col cols="12" lg="4" sm="12" class="d-flex justify-center order-sml-first">
                    <div class="text-center top-spacer">
                        <div class="avatar-border">
                            <v-avatar size="110" class="userImage">
                                <img :src="profilePicture || UserImage" alt="Mathew" width="110" @click="triggerFileInput" />
                                <Icon v-if="isOwnProfile" icon="solar:pen-linear" class="edit-icon" height="25" />
                            </v-avatar>
                            <input v-if="isOwnProfile" type="file" ref="fileInput" @change="onFileChange" style="display: none" />
                        </div>
                        <h5 class="text-h5 mt-4 mb-1 font-weight-bold profile-name">{{ fullName }}</h5>
                        <span class="textSecondary font-weight-medium profile-role">{{ role }}</span>
                    </div>
                </v-col>
                <v-col cols="12" lg="4" class="d-flex align-center justify-center justify-lg-end order-sm-third">
                    <div class="d-flex align-center justify-space-between px-10 py-1 gap-2 social-buttons">
                        <v-btn v-if="socialLinks.facebook" :href="socialLinks.facebook" target="_blank" icon variant="flat" size="small" color="primary" class="btn-brand-facebook social-btn">
                            <Icon icon="mdi:facebook" height="20" />
                        </v-btn>
                        <v-btn v-if="socialLinks.twitter" :href="socialLinks.twitter" target="_blank" icon variant="flat" size="small" color="primary" class="btn-brand-twitter social-btn">
                            <Icon icon="mdi:twitter" height="20" />
                        </v-btn>
                        <v-btn v-if="socialLinks.linkedin" :href="socialLinks.linkedin" target="_blank" icon variant="flat" size="small" color="primary" class="btn-brand-linkedin social-btn">
                            <Icon icon="mdi:linkedin" height="20" />
                        </v-btn>
                        <v-btn v-if="socialLinks.instagram" :href="socialLinks.instagram" target="_blank" icon variant="flat" size="small" color="primary" class="btn-brand-instagram social-btn">
                            <Icon icon="mdi:instagram" height="20" />
                        </v-btn>
                        <v-btn v-if="isOwnProfile" icon class="ml-2 edit-social-btn" @click="isEditing = true" size="small">
                            <Icon icon="solar:pen-linear" class="text-success" height="20" />
                        </v-btn>
                        <v-dialog v-model="isEditing" persistent max-width="600px">
                        <v-card variant="outlined" class="social-dialog">
                                <v-card-title class="pa-4 bg-primary">
                                    <span class="title text-white">Ingresa Redes Sociales</span>
                                </v-card-title>
                                <v-card-text class="pa-4">
                                    <v-text-field v-model="socialLinks.facebook" label="Facebook" prepend-icon="mdi-facebook" variant="outlined" class="mb-3" />
                                    <v-text-field v-model="socialLinks.twitter" label="Twitter" prepend-icon="mdi-twitter" variant="outlined" class="mb-3" />
                                    <v-text-field v-model="socialLinks.linkedin" label="LinkedIn" prepend-icon="mdi-linkedin" variant="outlined" class="mb-3" />
                                    <v-text-field v-model="socialLinks.instagram" label="Instagram" prepend-icon="mdi-instagram" variant="outlined" />
                                </v-card-text>
                                <v-card-actions class="pa-4">
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="flat" @click="isEditing = false">Cancelar</v-btn>
                                    <v-btn color="primary" variant="flat" @click="saveSocialLinks">Guardar</v-btn>
                                </v-card-actions>
                        </v-card>
                    </v-dialog>
                    </div>
                </v-col>
                <v-col md="12" class="order-sm-last">
                    <v-tabs v-model="tab" color="primary" class="profiletab bg-lightprimary">
                        <v-tab v-for="item in items" :key="item.tab" :to="item.href" class="font-weight-medium text-subtitle-1 profile-tab">
                            <component :is="item.icon" size="18" stroke-width="1.5" class="mr-2"></component>
                            {{ item.tab }}
                        </v-tab>
                    </v-tabs>
                </v-col>
            </v-row>
        </div>
    </v-card>
</template>

<style scoped>
.profile-banner-card {
    border-radius: 16px !important;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
    transition: all 0.3s ease;
}

.profile-banner-card:hover {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}

.banner-gradient {
    position: relative;
    overflow: hidden;
}

.banner-gradient::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 50%, rgba(236, 72, 153, 0.3) 100%);
    z-index: 1;
}

.banner-image {
    object-fit: cover;
    filter: brightness(0.9);
    transition: transform 0.5s ease;
}

.banner-content {
    position: relative;
    z-index: 2;
    background: white;
}

.avatar-border {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    border-radius: 50%;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    position: relative;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
}

.avatar-border:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.userImage {
    border: 5px solid rgb(255, 255, 255);
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
}

.userImage:hover {
    transform: scale(1.02);
}

.edit-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    padding: 8px;
    display: none;
    z-index: 10;
    transition: all 0.3s ease;
}

.avatar-border:hover .edit-icon {
    display: block;
    animation: fadeIn 0.3s ease;
}

.edit-icon:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: translate(-50%, -50%) scale(1.1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.8);
    }
    to {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.top-spacer {
    margin-top: -100px;
}

.profile-name {
    color: #1e293b;
    letter-spacing: -0.02em;
}

.profile-role {
    color: #64748b;
    font-size: 0.95rem;
    text-transform: capitalize;
}

.social-buttons {
    flex-wrap: wrap;
}

.social-btn {
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-social-btn {
    transition: all 0.3s ease;
}

.edit-social-btn:hover {
    transform: scale(1.1);
}

.profiletab {
    border-radius: 0 0 16px 16px;
}

.profiletab .v-slide-group__content {
    justify-content: end;
    padding: 0 16px;
}

.profile-tab {
    transition: all 0.3s ease;
    border-radius: 8px 8px 0 0;
    margin: 0 4px;
}

.profile-tab:hover {
    background-color: rgba(99, 102, 241, 0.08);
}

.social-dialog {
    border-radius: 16px !important;
}

@media (max-width: 1023px) {
    .order-sm-second {
        order: 2;
    }
    .order-sml-first {
        order: 1;
    }
    .order-sm-third {
        order: 3;
    }
    .order-sm-last {
        order: 4;
    }
    
    .top-spacer {
        margin-top: -90px;
    }
    
    .social-buttons {
        justify-content: center;
        padding: 8px;
    }
}

.btn-brand-facebook {
    background-color: rgb(24, 119, 242) !important;
    color: white !important;
}

.btn-brand-twitter {
    background-color: rgb(29, 161, 242) !important;
    color: white !important;
}

.btn-brand-linkedin {
    background-color: rgb(10, 102, 194) !important;
    color: white !important;
}

.btn-brand-instagram {
    background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important;
    color: white !important;
}
</style>