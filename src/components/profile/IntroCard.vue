<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const userId = authStore.userId;

// Getting email of the user
const email = ref('');

const fetchUserData = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/users/user/${userId}`);
        const userData = response.data;
        email.value = userData.email;
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
};

const description = ref('None');
const valid = ref(true);
const dialog = ref(false);

onMounted(() => {
    fetchUserData();
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
                                    <span class="title text-white">Editar Carta Presentación</span>
                                </v-card-title>

                                <v-card-text>
                                    <v-form ref="form" v-model="valid" lazy-validation>
                                        <v-row>
                                            <v-col cols="12" sm="12">
                                                <v-text-field variant="outlined" hide-details label="Description"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <v-text-field variant="outlined" hide-details label="Description"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <v-text-field variant="outlined" hide-details label="User info"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <v-text-field
                                                    variant="outlined"
                                                    hide-details
                                                    label="User email"
                                                    type="email"
                                                ></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <v-text-field variant="outlined" hide-details label="Phone" type="phone"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <v-text-field variant="outlined" hide-details label="Joining Date"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="6">
                                                <v-text-field variant="outlined" hide-details label="Role"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" sm="12">
                                                <v-select variant="outlined" hide-details label="Role Background"></v-select>
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
                        <span class="text-h6">Sir, P P Institute Of Science</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MailIcon size="21" />
                        <span class="text-h6">{{ email }}</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <DeviceDesktopIcon size="21" />
                        <span class="text-h6">www.xyz.com</span>
                    </div>
                    <div class="d-flex gap-3 mb-5">
                        <MapPinIcon size="21" />
                        <span class="text-h6">Newyork, USA - 100001</span>
                    </div>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>
