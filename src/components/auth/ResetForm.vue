<script setup lang="ts">
import { ref } from 'vue';
const valid = ref(true);
const email = ref('');
const emailRules = ref([
    (v: string) => !!v || 'El correo electrónico es obligatorio.',
    (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido.'
]);
</script>
<template>
    <v-form ref="form" v-model="valid" lazy-validation class="auth-form-modern">
        <div class="form-content">
            <div class="form-field-wrapper">
                <v-label class="form-label">Correo electrónico</v-label>
                <v-text-field 
                    v-model="email" 
                    :rules="emailRules" 
                    required
                    variant="outlined"
                    density="comfortable"
                    color="primary"
                    class="form-input-modern"
                    prepend-inner-icon="mdi-email-outline"
                    placeholder="tu@correo.com"
                ></v-text-field>
            </div>
            <div class="form-actions">
                <v-btn 
                    size="x-large" 
                    color="primary" 
                    block
                    submit
                    class="submit-btn-modern"
                >
                    <span class="btn-text">Recuperar Contraseña</span>
                    <template v-slot:prepend>
                        <v-icon>mdi-lock-reset</v-icon>
                    </template>
                </v-btn>
            </div>
        </div>
    </v-form>
</template>

<style scoped>
.auth-form-modern {
    width: 100%;
}

.form-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-field-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #475569;
    margin-bottom: 4px;
}

.form-input-modern :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.form-input-modern :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.form-input-modern :deep(.v-field--focused) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
}

.form-input-modern :deep(.v-field__input) {
    padding: 12px 16px;
    font-size: 0.95rem;
}

.form-input-modern :deep(.v-field__prepend-inner) {
    padding-right: 12px;
    color: rgb(99, 102, 241);
}

.form-actions {
    margin-top: 8px;
}

.submit-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.submit-btn-modern:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.submit-btn-modern:active:not(:disabled) {
    transform: translateY(0);
}

.btn-text {
    font-size: 1rem;
    font-weight: 600;
}
</style>
