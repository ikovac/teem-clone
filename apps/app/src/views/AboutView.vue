<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<script setup lang="ts">
import { useAuth0 } from '@auth0/auth0-vue';

const { getAccessTokenSilently } = useAuth0();

const getToken = async () => {
  const token = await getAccessTokenSilently();
  console.log('Token: ', token);
};

getToken();
</script>
