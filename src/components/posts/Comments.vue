<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import CommentActions from './commentActions.vue';

const authStore = useAuthStore();
const userId = authStore.userId;

const props = defineProps({
    comments: Object || Array,
    postId: String
});

// Función para formatear fecha, hora y minutos
const formatDateTime = (date: string) => {
  if (!date) return '';
  return new Date(date).toLocaleString('es-ES', {
    weekday: 'long',   // Día de la semana (opcional)
    day: 'numeric',    // Día
    month: 'long',     // Mes
    year: 'numeric',   // Año
    hour: '2-digit',   // Hora (en formato 2 dígitos)
    minute: '2-digit', // Minutos (en formato 2 dígitos)
  });
};
</script>

<template>
    <v-card variant="flat" class="mb-3 pa-5 bg-light">
        <div class="d-flex gap-3 align-center">
            <v-avatar size="40" color="success" variant="flat" class="text-h5 font-weight-medium"> D </v-avatar>
            <div class="d-block d-sm-flex align-center gap-3">
                <h6 class="text-h6">{{ comments?.user.name }} {{ comments?.user.lastName }}</h6>
                <span class="text-subtitle-2 opacity-50">
                    <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                    {{ formatDateTime(comments?.dateCreated) }}
                </span>
                <div v-if="comments?.user.id === userId">
                    <CommentActions/>
                </div>
            </div>
        </div>
        <div class="py-3 text-body-1">
            {{ comments?.text }}
        </div>
    </v-card>
</template>

<style lang="scss" scoped>
.border-light {
    border: 1px solid rgb(var(--v-theme-grey100));
}
</style>
