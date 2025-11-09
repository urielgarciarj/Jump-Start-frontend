<script setup>
import { Icon } from '@iconify/vue';
const props = defineProps({ item: Object });
</script>

<template>
    <v-list-subheader class="smallCap modern-nav-header text-uppercase text-subtitle-2 mt-4 mb-2 font-weight-bold d-flex align-items-center">
        <span class="mini-icon">
            <Icon icon="solar:menu-dots-bold-duotone" height="16" width="16" class="iconClass" />
        </span>
        <span class="mini-text">{{ $t(props.item.header) }}</span> 
    </v-list-subheader>
</template>

<style scoped>
.modern-nav-header {
    color: rgba(99, 102, 241, 0.8) !important;
    letter-spacing: 0.5px;
    padding: 8px 12px !important;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.03) 100%);
    margin: 12px 0 8px 0 !important;
}

.iconClass {
    color: rgba(99, 102, 241, 0.7);
    margin-right: 8px;
}
</style>
