<template>
  <div class="py-2 px-8">
    <h1 class="text-center my-5">My Reservations</h1>
    <v-data-table-server
      :headers="headers"
      :items="reservations"
      :items-length="reservations.length"
      :loading="isLoading">
      <template #bottom></template>
    </v-data-table-server>
  </div>
</template>

<script setup lang="ts">
import * as reservationsApi from '@/api/reservations';
import type { Reservation } from '@/models/reservation';
import { ref } from 'vue';

const reservations = ref<Reservation[]>([]);
const isLoading = ref(true);

reservationsApi.getAll().then(result => {
  reservations.value = result.data;
  isLoading.value = false;
});

const headers = [
  {
    value: 'title',
    title: 'Inventory Item',
    align: 'start',
    sortable: false,
  },
  {
    value: 'startDate',
    title: 'Start Date',
    align: 'start',
    sortable: false,
  },
  {
    value: 'endDate',
    title: 'End Date',
    align: 'start',
    sortable: false,
  },
] as const;
</script>
