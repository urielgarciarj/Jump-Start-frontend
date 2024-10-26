<template>
	<div v-if="error" class="alert alert-danger d-flex align-items-center" role="alert">
		<svg class="bi flex-shrink-0 me-2" width="24" height="24">
			<use xlink:href="#exclamation-triangle-fill"></use>
		</svg>
		<div>{{ error }}</div>
	</div>
	<div class="container mt-4">
	  <h2>Log in users</h2>
	  <form @submit.prevent="loginUsers">
		<!-- Email -->
		<div class="form-group">
		  <label for="input-name">Email</label>
		  <input type="text" class="form-control" id="input-email" v-model="usuario.email" required>
		</div>
  
		<!-- Password -->
		<div class="form-group">
		  <label for="input-password">Password</label>
		  <input type="password" class="form-control" id="input-password" v-model="usuario.password" required>
		</div>
  
		<br />
		<!-- Log in button -->
		<button type="submit" class="btn btn-primary">Log in</button>
	  </form>
	</div>

</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      usuario: {
        email: '',
        password: '',
      },
	  error: null
    };
  },
  methods: {
    async loginUsers() {
      try {
        // Send info to the backend
        const response = await axios.post('http://localhost:3000/login', this.usuario);
        console.log('Usuario ingresado:', response.data);
      } catch (error) {
        console.error('Error to trying access:', error);
        // Validate if it is 409 error
        if (error.response && error.response.status === 409) {
          this.error = 'Incorrect email';
        } else {
          this.error = 'An unexpected error occurred, please try again.';
        }
      }
    }
  }
};
</script>

<style>

</style>
