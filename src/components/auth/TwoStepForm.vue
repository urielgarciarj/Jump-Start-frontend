<template>
    <div class="two-step-form-modern">
        <v-label class="form-label-large">Ingresa tu código de seguridad de 6 dígitos</v-label>
        <div class="verification-code-wrapper">
            <v-text-field
                v-for="(digit, index) in digits"
                :key="index"
                v-model="digits[index]"
                variant="outlined"
                density="comfortable"
                color="primary"
                class="verification-input"
                maxlength="1"
                @input="handleInput(index, $event)"
                @keydown="handleKeydown(index, $event)"
            ></v-text-field>
        </div>
        <div class="form-actions">
            <v-btn 
                color="primary" 
                size="x-large" 
                block 
                class="submit-btn-modern"
                :disabled="!isCodeComplete"
            >
                <span class="btn-text">Verificar Cuenta</span>
                <template v-slot:prepend>
                    <v-icon>mdi-shield-check</v-icon>
                </template>
            </v-btn>
        </div>
        <div class="resend-section">
            <p class="resend-text">
                ¿No recibiste el código?
                <RouterLink to="/" class="resend-link"> Reenviar</RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const digits = ref(['', '', '', '', '', '']);

const isCodeComplete = computed(() => {
    return digits.value.every(digit => digit !== '');
});

const handleInput = (index: number, event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    if (value && index < 5) {
        const nextInput = document.querySelector(`.verification-input:nth-child(${index + 2}) input`) as HTMLInputElement;
        if (nextInput) {
            nextInput.focus();
        }
    }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
    if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
        const prevInput = document.querySelector(`.verification-input:nth-child(${index}) input`) as HTMLInputElement;
        if (prevInput) {
            prevInput.focus();
        }
    }
};
</script>

<style scoped>
.two-step-form-modern {
    width: 100%;
}

.form-label-large {
    font-weight: 600;
    font-size: 1rem;
    color: #475569;
    margin-bottom: 24px;
    display: block;
    text-align: center;
}

.verification-code-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 32px;
}

.verification-input {
    flex: 1;
    max-width: 60px;
}

.verification-input :deep(.v-field) {
    border-radius: 12px;
    background-color: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    text-align: center;
}

.verification-input :deep(.v-field:hover) {
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.verification-input :deep(.v-field--focused) {
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
    border-color: rgb(99, 102, 241);
}

.verification-input :deep(.v-field__input) {
    padding: 16px;
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    color: rgb(99, 102, 241);
}

.form-actions {
    margin-bottom: 24px;
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

.submit-btn-modern:disabled {
    opacity: 0.6;
    box-shadow: none;
}

.btn-text {
    font-size: 1rem;
    font-weight: 600;
}

.resend-section {
    text-align: center;
    margin-top: 24px;
}

.resend-text {
    font-size: 0.95rem;
    color: #64748b;
    font-weight: 400;
    margin: 0;
}

.resend-link {
    color: rgb(99, 102, 241);
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    margin-left: 4px;
}

.resend-link:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

@media screen and (max-width: 600px) {
    .verification-code-wrapper {
        gap: 8px;
    }
    
    .verification-input {
        max-width: 50px;
    }
    
    .verification-input :deep(.v-field__input) {
        font-size: 1.2rem;
        padding: 12px;
    }
}
</style>