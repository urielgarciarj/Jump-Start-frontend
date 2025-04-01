<script setup lang="ts">
import LogoIcon from '@/layouts/full/logo/LogoIcon.vue';
import LogoImage from '@/assets/images/logos/long-jump-img.png';
/* Login form */
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
    <div class="pa-3">
        <v-row class="h-100vh mh-100">
            <v-col cols="12" lg="5" xl="4" class="bg-surface auth">
                <div class="d-flex justify-center align-center h-100">
                    <div class="mt-xl-0 mt-5 auth-card">
                        <LogoIcon />
                        <h2 class="text-h3 my-3 heading">Iniciar Sesión</h2>
                        <div class="mb-6">Jump Start</div>
                        <LoginForm />
                        <p class="d-flex align-center justify-center text-textSecondary mt-6 font-weight-medium">
                            <RouterLink
                                class="pl-0 text-primary opacity-1 pl-2 font-weight-medium text-decoration-none"
                                height="auto"
                                to="/auth/register"
                                variant="plain"
                                >Registrarse</RouterLink
                            >
                        </p>
                    </div>
                </div>
            </v-col>
            <v-col cols="12" lg="7" xl="8" class="d-lg-flex d-none align-center justify-center authentication bg-textPrimary position-relative">
                <div class="circle-top"></div>
                <div>
                    <img :src="LogoImage" class="image-bottom" alt="home" />
                </div>
                <div class="d-flex justify-center align-center w-100 h-n80">
                    <v-row class="justify-center z-index-2">
                        <v-col cols="6">
                            <h1 class="text-h1">
                                Bienvenido a Jump Start 
                            </h1>
                            <p class="text-h6 opacity-80 font-weight-regular mt-4">
                                Inicia sesión para acceder a ofertas laborales, conectar con profesores y mostrar tus proyectos personales.<br />
                                ¡Es el primer paso hacia tu futuro profesional!
                            </p>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped>
.image-bottom {
  position: absolute;
  bottom: 0;
  right: 1%;
  height: 450px;
  width: 450px;
  display: block;
  background: 0 0;
  z-index: 1;
  opacity: 0.5;
}
</style>