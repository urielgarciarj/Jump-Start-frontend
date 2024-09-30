<template>
  <div class="container mt-4">
    <h2>Registro de Usuario</h2>
    <form @submit.prevent="registrarUsuario">
      <!-- Nombre -->
      <div class="form-group">
        <label for="input-nombre">Nombre</label>
        <input type="text" class="form-control" id="input-nombre" v-model="usuario.nombre" required>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label for="input-email">Email</label>
        <input type="email" class="form-control" id="input-email" v-model="usuario.email" required>
      </div>

      <!-- Contraseña -->
      <div class="form-group">
        <label for="input-password">Contraseña</label>
        <input type="password" class="form-control" id="input-password" v-model="usuario.password" required>
      </div>

      <!-- Botón de registro -->
      <button type="submit" class="btn btn-primary">Registrar</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      usuario: {
        nombre: '',
        email: '',
        password: ''
      }
    };
  },
  methods: {
    registrarUsuario() {
      // Aquí puedes agregar la lógica para enviar los datos a tu backend
      // Por ejemplo, puedes imprimir los datos en la consola para verificar
      console.log('Usuario registrado:', this.usuario);
      // Luego puedes enviar los datos usando Axios u otra biblioteca para hacer solicitudes HTTP
    }
  }
};
</script>

<style scoped>
/* Estilos opcionales */
</style>
