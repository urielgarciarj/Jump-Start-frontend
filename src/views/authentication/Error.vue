<template>
    <div class="error-page-modern">
        <div class="error-content">
            <div class="error-image-wrapper">
                <img src="@/assets/images/backgrounds/errorimg.svg" class="error-image" alt="404" />
            </div>
            <h1 class="error-title">¡Oops!</h1>
            <h2 class="error-subtitle">La página que buscas no se pudo encontrar</h2>
            <p class="error-description">
                Parece que la página que estás buscando no existe o ha sido movida.
                <br />
                Por favor, verifica la URL o regresa a la página principal.
            </p>
            <v-btn 
                color="primary" 
                size="x-large" 
                class="error-btn-modern"
                to="/"
            >
                <span class="btn-text">Volver al Inicio</span>
                <template v-slot:prepend>
                    <v-icon>mdi-home</v-icon>
                </template>
            </v-btn>
        </div>
        <div class="error-background">
            <div class="error-circle circle-1"></div>
            <div class="error-circle circle-2"></div>
            <div class="error-circle circle-3"></div>
        </div>
    </div>
</template>

<style scoped>
.error-page-modern {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    position: relative;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    overflow: hidden;
    padding: 40px 20px;
}

.error-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.error-circle {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
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

.error-content {
    position: relative;
    z-index: 1;
    max-width: 600px;
    animation: fadeInUp 0.8s ease;
}

.error-image-wrapper {
    margin-bottom: 32px;
    animation: fadeInScale 1s ease;
}

.error-image {
    width: 100%;
    max-width: 400px;
    height: auto;
    filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));
}

.error-title {
    font-size: 4rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 16px;
    line-height: 1.2;
}

.error-subtitle {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 16px;
}

.error-description {
    font-size: 1.1rem;
    color: #64748b;
    font-weight: 400;
    line-height: 1.8;
    margin-bottom: 40px;
}

.error-btn-modern {
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
    padding: 16px 32px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    transition: all 0.3s ease;
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(168, 85, 247) 100%);
}

.error-btn-modern:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.error-btn-modern:active {
    transform: translateY(0);
}

.btn-text {
    font-size: 1rem;
    font-weight: 600;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
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

@media screen and (max-width: 768px) {
    .error-title {
        font-size: 3rem;
    }
    
    .error-subtitle {
        font-size: 1.5rem;
    }
    
    .error-description {
        font-size: 1rem;
    }
    
    .error-image {
        max-width: 300px;
    }
}
</style>
