<script setup lang="ts">
import LogoIcon from '@/layouts/full/logo/LogoIcon.vue';
import LogoImage from '@/assets/images/logos/long-jump-img.png';
/* Login form */
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
    <div class="auth-container">
        <v-row class="h-100vh mh-100 ma-0">
            <v-col cols="12" lg="5" xl="4" class="auth-form-section bg-surface pa-0">
                <div class="d-flex justify-center align-center h-100 pa-6">
                    <div class="auth-card-modern">
                        <div class="logo-wrapper">
                            <LogoIcon />
                        </div>
                        <div class="auth-header">
                            <h2 class="auth-title">Iniciar Sesión</h2>
                            <p class="auth-subtitle">Bienvenido de nuevo a Jump Start</p>
                        </div>
                        <LoginForm />
                        <div class="auth-footer">
                            <p class="text-center text-textSecondary">
                                ¿No tienes una cuenta?
                                <RouterLink
                                    class="auth-link"
                                    to="/auth/register"
                                >
                                    Registrarse
                                </RouterLink>
                            </p>
                        </div>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" lg="7" xl="8" class="auth-hero-section d-lg-flex d-none align-center justify-center position-relative pa-0">
                <div class="hero-background">
                    <div class="gradient-overlay"></div>
                    <div class="circle-decoration circle-1"></div>
                    <div class="circle-decoration circle-2"></div>
                    <div class="circle-decoration circle-3"></div>
                </div>
                <div class="hero-content">
                    <div class="hero-image-wrapper">
                        <img :src="LogoImage" class="hero-image" alt="Jump Start" />
                    </div>
                    <div class="hero-text">
                        <h1 class="hero-title">
                            Bienvenido a Jump Start
                        </h1>
                        <p class="hero-description">
                            Inicia sesión para acceder a ofertas laborales, conectar con profesores y mostrar tus proyectos personales.
                            <br /><br />
                            <span class="hero-highlight">¡Es el primer paso hacia tu futuro profesional!</span>
                        </p>
                    </div>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>
.auth-container {
    overflow: hidden;
}

.auth-form-section {
    position: relative;
    z-index: 2;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.auth-card-modern {
    width: 100%;
    max-width: 460px;
    animation: fadeInUp 0.6s ease;
}

.logo-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
    animation: fadeIn 0.8s ease;
}

.logo-wrapper :deep(img) {
    transition: transform 0.3s ease;
}

.logo-wrapper:hover :deep(img) {
    transform: scale(1.05);
}

.auth-header {
    text-align: center;
    margin-bottom: 40px;
}

.auth-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.auth-subtitle {
    font-size: 1rem;
    color: #64748b;
    font-weight: 400;
    margin: 0;
}

.auth-footer {
    margin-top: 32px;
    padding-top: 24px;
}

.auth-link {
    color: rgb(99, 102, 241);
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
    margin-left: 4px;
}

.auth-link:hover {
    color: rgb(79, 70, 229);
    text-decoration: underline;
}

.auth-hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
    position: relative;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.gradient-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%);
    z-index: 2;
}

.circle-decoration {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1;
    animation: float 20s infinite ease-in-out;
}

.circle-1 {
    width: 400px;
    height: 400px;
    top: -150px;
    left: -150px;
    animation-delay: 0s;
}

.circle-2 {
    width: 300px;
    height: 300px;
    bottom: -100px;
    right: -100px;
    animation-delay: 5s;
}

.circle-3 {
    width: 200px;
    height: 200px;
    top: 50%;
    right: 10%;
    animation-delay: 10s;
}

.hero-content {
    position: relative;
    z-index: 3;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
}

.hero-image-wrapper {
    margin-bottom: 60px;
    animation: fadeInScale 1s ease;
}

.hero-image {
    height: 350px;
    width: auto;
    filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
    animation: floatImage 6s ease-in-out infinite;
}

.hero-text {
    text-align: center;
    max-width: 600px;
    animation: fadeInUp 1s ease 0.3s both;
}

.hero-title {
    font-size: 3rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 24px;
    line-height: 1.2;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero-description {
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 400;
    line-height: 1.8;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hero-highlight {
    font-weight: 600;
    color: #ffffff;
    font-size: 1.3rem;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInScale {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0) rotate(0deg);
    }
    33% {
        transform: translate(30px, -30px) rotate(120deg);
    }
    66% {
        transform: translate(-20px, 20px) rotate(240deg);
    }
}

@keyframes floatImage {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-20px);
    }
}

@media screen and (max-width: 1280px) {
    .mh-100 {
        height: 100% !important;
    }
}

@media screen and (max-width: 960px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-description {
        font-size: 1rem;
    }
    
    .hero-image {
        height: 250px;
    }
}
</style>