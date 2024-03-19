<template>
  <v-layout>
    <v-overlay
      :model-value="isLoading"
      opacity="0.8"
      class="d-flex justify-center align-center">
      <v-progress-circular color="white" indeterminate />
    </v-overlay>

    <v-app-bar color="primary" prominent>
      <v-app-bar-nav-icon variant="text" @click="isOpen = !isOpen" />
      <v-toolbar-title>Teem Clone</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="mr-2">{{ user?.email }}</span>
    </v-app-bar>

    <v-navigation-drawer v-model="isOpen" mobile-breakpoint="md">
      <v-list nav>
        <v-list-item
          :to="{ name: 'dashboard' }"
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          value="dashboard" />
        <v-list-item
          :to="{ name: 'my-reservations' }"
          prepend-icon="mdi-calendar-account"
          title="My Reservations"
          value="my-reservations" />
        <v-list-item
          v-if="isAdmin"
          :to="{ name: 'user-management' }"
          prepend-icon="mdi-account-group"
          title="User Management"
          value="user-management" />
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn @click="logout" block>Logout</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="full-page">
      <RouterView />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { Role } from '@/models/user';
import { useAuth0 } from '@auth0/auth0-vue';
import { computed, ref } from 'vue';

const { logout, user, isLoading } = useAuth0();

const isOpen = ref(false);
const isAdmin = computed(() => user.value?.role === Role.ADMIN);
</script>

<style scoped>
.full-page {
  height: 100vh;
}
</style>
