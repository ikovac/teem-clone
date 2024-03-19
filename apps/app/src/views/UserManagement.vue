<script setup lang="ts">
import * as usersApi from '@/api/users';
import { Role, type User } from '@/models/user';
import { computed, reactive, ref } from 'vue';

const users = ref<User[]>([]);
const dialog = ref(false);
const page = ref(1);
const itemsPerPage = ref(10);
const newUser = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: Role.USER,
});
const count = ref<number>(0);
const isLoading = ref(true);
const roleItems = computed(() => {
  return Object.entries(Role).map(([key, value]) => ({ title: key, value }));
});

function fetchUsers(options: { page: number; itemsPerPage: number }) {
  isLoading.value = true;
  return usersApi
    .getAll(options)
    .then(result => {
      users.value = result.data;
      count.value = result.count;
    })
    .finally(() => (isLoading.value = false));
}

function createUser() {
  return usersApi.create(newUser).then(() => {
    newUser.firstName = '';
    newUser.lastName = '';
    newUser.email = '';
    newUser.role = Role.USER;
    page.value = 1;
    itemsPerPage.value = 10;
    dialog.value = false;
    return fetchUsers({ page: page.value, itemsPerPage: itemsPerPage.value });
  });
}

const headers = [
  {
    value: 'email',
    title: 'Email',
    align: 'start',
    sortable: false,
  },
  {
    value: 'role',
    title: 'Role',
    align: 'start',
    sortable: false,
  },
  {
    value: 'firstName',
    title: 'First name',
    align: 'start',
    sortable: false,
  },
  {
    value: 'lastName',
    title: 'Last name',
    align: 'start',
    sortable: false,
  },
] as const;
</script>

<template>
  <div class="py-2 px-8">
    <h1 class="text-center my-5">User Management</h1>

    <v-dialog max-width="500" v-model="dialog">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn v-bind="activatorProps" color="primary" class="float-right">
          Create User
        </v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card title="Create User">
          <div class="pa-4">
            <v-text-field v-model="newUser.firstName" label="First name" />
            <v-text-field v-model="newUser.lastName" label="Last name" />
            <v-text-field v-model="newUser.email" label="Email" />
            <v-select label="Role" v-model="newUser.role" :items="roleItems" />
          </div>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="isActive.value = false">Close</v-btn>
            <v-btn @click="createUser" color="success" type="submit"
              >Create</v-btn
            >
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>

    <v-data-table-server
      :v-model:page="page"
      :v-model:itemsPerPage="itemsPerPage"
      @update:options="fetchUsers"
      :headers="headers"
      :items="users"
      :items-length="count"
      :loading="isLoading" />
  </div>
</template>
