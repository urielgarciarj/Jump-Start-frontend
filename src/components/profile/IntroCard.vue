<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

// Getting email of the user
const email = ref('');
const profileLocation = ref('');
const profileUniversity = ref('');
const profilePhone = ref('');

const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${userId}`);
        const userData = response.data;
        email.value = userData.email;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const fetchProfileData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/profiles/${userId}`);
        const profileData = response.data;
        profileLocation.value = profileData.location;
        profileUniversity.value = profileData.university;
        profilePhone.value = profileData.phone;
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
};

const description = ref('None');
const valid = ref(true);
const dialog = ref(false);
const checkbox1 = ref(true);

onMounted(() => {
    fetchUserData();
    fetchProfileData();
});

function close() {
    dialog.value = false;
}

function save() {
    close();
}
</script>

<template>
    <v-row>
        <v-col cols="12">
            <v-card variant="outlined">
                <v-card-item class="d-flex justify-space-between align-center">
                    <div class="d-flex gap-3 mb-3">
                        <h4 class="text-h4">Introduction</h4>
                        <v-dialog v-model="dialog" max-width="500">
                            <template v-slot:activator="{ props }">
                                <v-btn color="lightsuccess" v-bind="props" size="29">
                                    <Icon icon="solar:pen-linear" class="text-success" height="15" />
                                    <v-tooltip location="bottom">Editar</v-tooltip>
                                </v-btn>
                            </template>
                            <v-card>
                                <v-card-title class="pa-4 bg-primary">
                                    <span class="title text-white">Editar Carta de Presentación</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-form ref="form" v-model="valid" lazy-validation>
                                        <v-row>
                                            <v-col cols="12" lg="12">
                                                <v-label class="mb-2 font-weight-medium">Educacion Universitaria</v-label>
                                                <v-text-field
                                                    v-model="profileUniversity"
                                                    hint="We'll never share your email with anyone else."
                                                    persistent-hint
                                                    variant="outlined"
                                                    placeholder="Escribe tu institucion educativa"
                                                    color="primary"
                                                ></v-text-field>
                                                <v-label class="mb-2 font-weight-medium mt-5">Email</v-label>
                                                <v-text-field
                                                    v-model="email"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Escribe tu correo electronico"
                                                    color="primary"
                                                ></v-text-field>
                                                <v-label class="mb-2 font-weight-medium mt-5">Telefono</v-label>
                                                <v-text-field
                                                    v-model="profilePhone"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Escribe tu telefono"
                                                    color="primary"
                                                ></v-text-field>
                                                <v-label class="mb-2 font-weight-medium mt-5">Ubicacion</v-label>
                                                <v-text-field
                                                    v-model="profileLocation"
                                                    persistent-hint
                                                    variant="outlined"
                                                    hide-details
                                                    placeholder="Ubicacion"
                                                    color="primary"
                                                ></v-text-field>
                                                <div class="my-3">
                                                    <v-checkbox
                                                        density="compact"
                                                        v-model="checkbox1"
                                                        hide-details
                                                        color="primary"
                                                        label="Check Me Out!"
                                                    ></v-checkbox>
                                                </div>
                                                <v-btn color="primary" flat>Submit</v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>

                                <v-card-actions class="pa-4">
                                    <v-spacer></v-spacer>
                                    <v-btn color="error" variant="flat" @click="close">Cancel</v-btn>
                                    <v-btn color="primary" variant="flat" @click="save">Save</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </div>
                    <p class="my-3 text-subtitle-1 lh-md textSecondary mb-6">
                        Hello, I am David McMichael. I love making websites and graphics. Lorem ipsum dolor sit amet, consectetur adipiscing
                        elit.
                    </p>
                    <div class="d-flex gap-3 mb-5">
                        <BriefcaseIcon size="21" />
                        <span class="text-h6">{{ profileUniversity || 'Aun no agregado' }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MailIcon size="21" />
                        <span class="text-h6">{{ email || 'Aun no agregado' }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <DeviceDesktopIcon size="21" />
                        <span class="text-h6">{{ profilePhone || 'Aun no agregado' }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MapPinIcon size="21" />
                        <span class="text-h6">{{ profileLocation || 'Aun no agregado' }}</span>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
