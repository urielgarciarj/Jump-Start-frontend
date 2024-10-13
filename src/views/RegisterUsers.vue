<template>
	<div class="container mt-4">
	  <h2>Registro de Usuario</h2>
	  <form @submit.prevent="registrarUsuario">
		<!-- Nombre -->
		<div class="form-group">
		  <label for="input-nombre">Nombre</label>
		  <input type="text" class="form-control" id="input-nombre" v-model="usuario.name" required>
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
  
		<br />
		<!-- Botón de registro -->
		<button type="submit" class="btn btn-primary">Registrar</button>
	  </form>
	</div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      usuario: {
        name: '',
        password: '',
        email: ''
      },
      token: 'xyz123'
    };
  },
  methods: {
    async registrarUsuario() {
      try {
        // Enviar los datos al backend
        const response = await axios.post('http://localhost:3000/users', this.usuario);
        console.log('Usuario registrado:', response.data);
      } catch (error) {
        console.error('Error al registrar el usuario:', error);
      }
    }
  }
};
</script>

<style>

</style>
