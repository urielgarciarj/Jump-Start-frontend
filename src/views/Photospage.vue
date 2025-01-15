<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-file-input
          label="Upload Profile Picture"
          @change="onFileChange"
          accept="image/*"
          prepend-icon="mdi-camera"
        ></v-file-input>
      </v-col>
      <v-col cols="12">
        <v-btn @click="uploadImage" color="primary">Upload</v-btn>
      </v-col>
      <v-col cols="12" v-if="imageUrl">
        <v-img :src="imageUrl" alt="Profile Picture" max-width="300"></v-img>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
  data() {
    return {
      file: null as File | null,
      imageUrl: '',
    };
  },
  methods: {
    onFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.file = target.files[0];
      }
    },
    async uploadImage() {
      if (!this.file) {
        alert('Please select a file first.');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const response = await axios.post('http://localhost:3000/profiles/upload-profile-picture/11', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        this.imageUrl = response.data.fileUrl;
        console.log('Image uploaded:', this.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    },
  },
});
</script>

<style scoped>
.v-container {
  max-width: 600px;
  margin: auto;
}
</style>