<script setup lang="ts">
const props = defineProps({
    column: Object,
});

const capitalizeFirstLetter = (str: string) => {
    if(!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
</script>

<template>
    <v-card elevation="10" :class="'bg-' + column?.cardbg">
        <div class="pa-5">
            <div class="d-flex align-center justify-space-between">
                <h6 class="text-h6 font-weight-semibold">{{ capitalizeFirstLetter(column?.status) }}</h6>
            </div>
            <div v-for="project in column?.projects" :key="project.id" :project="project" class="mt-3 cursor-move">
                <v-card elevation="10" class="mb-5">
                    <div class="d-flex align-center justify-space-between px-4 py-2 pr-3">
                        <h6 class="text-h6 my-2 custom-text-primary">
                            <RouterLink class="text-decoration-none color-inherits custom-title" 
                                        :to="`/project/details/${project?.id}`" >
                                        {{ project?.name }}
                            </RouterLink>
                        </h6>
                    </div>
                    <div class="d-flex align-center justify-space-between px-4 py-2">
                        {{ project?.category }}
                    </div>
                </v-card>
            </div>
        </div>
    </v-card>
</template>
