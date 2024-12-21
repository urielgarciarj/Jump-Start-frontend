<script setup lang="ts">
import { ref } from 'vue';
//import { usePostsStore } from '@/stores/apps/userprofile/posts';
import uniqueId from 'lodash/uniqueId';

//const store = usePostsStore();
const props = defineProps({
    comments: Object || Array,
    postId: String
});
const replyValue = ref('');
const showReplyBox = ref(false);
const toggleReplybox = () => {
    return (showReplyBox.value = !showReplyBox.value);
};

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
            </div>
        </div>
        <div class="py-3 text-body-1">
            {{ comments?.text }}
        </div>
        <!---Like and comment count-->
        <!-- <div class="my-1 d-flex align-center gap-2">
            <v-tooltip text="Like">
                <template v-slot:activator="{ props }">
                    <div class="d-flex gap-2 me-4 align-center">
                        <v-btn icon color="primary" variant="flat" size="x-small" v-bind="props">
                            <ThumbUpIcon size="16" />
                        </v-btn>
                        <span class="text-body-1 font-weight-semibold">{{
                            comments?.data && comments?.data.likes && comments?.data.likes.value
                        }}</span>
                    </div>
                </template>
            </v-tooltip>

            <v-tooltip text="Reply">
                <template v-slot:activator="{ props }">
                    <v-btn icon color="secondary" variant="flat" v-bind="props" size="x-small" @click="toggleReplybox">
                        <ArrowBackUpIcon size="16" />
                    </v-btn>
                </template>
            </v-tooltip>
        </div> -->
    </v-card>
    <!-- <div v-if="comments?.data.replies" class="ml-10">
        <div v-for="reply in comments?.data.replies">
            <v-card variant="flat" class="mb-3 pa-5 bg-light">
                <div class="d-flex gap-3 align-center">
                    <v-avatar size="30">
                        <img :src="reply.profile.avatar" width="30" alt="avatar" />
                    </v-avatar>
                    <div class="d-block d-sm-flex align-center gap-3">
                        <h6 class="text-h6">{{ reply.profile.name }}</h6>
                        <span class="text-subtitle-2 opacity-50">
                            <CircleIcon size="8" fill="inherit" class="color-inherits mr-1" />
                            {{ reply.profile.time }}
                        </span>
                    </div>
                </div>
                <div class="py-3 text-body-1">
                    {{ reply.data.comment }}
                </div>
            </v-card>
        </div>
    </div> -->
    <!-- <div class="d-block d-sm-flex gap-3 align-center mb-5 ml-10">
        <v-avatar size="40" color="secondary" variant="flat" class="text-h5 font-weight-medium"> D </v-avatar>
        
        <v-text-field variant="outlined" color="primary" v-model="replyValue" label="Write Reply" hide-details></v-text-field>
        <v-btn color="secondary" class="mt-3 mt-sm-0" variant="flat" size="large" @click="onSubmit(postId, comments?.id, replyValue)">
            Reply
        </v-btn>
    </div> -->
</template>

<style lang="scss" scoped>
.border-light {
    border: 1px solid rgb(var(--v-theme-grey100));
}
</style>
