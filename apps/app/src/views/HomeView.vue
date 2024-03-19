<script setup lang="ts">
import * as inventoryItemsApi from '@/api/inventory-items';
import * as reservationsApi from '@/api/reservations';
import DashboardFilters from '@/components/DashboardFilters.vue';
import InventoryItemCard from '@/components/InventoryItem.vue';
import type { InventoryItem } from '@/models/inventory-item';
import { parse } from 'date-fns';
import { computed, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const inventoryItems = ref<InventoryItem[]>([]);
const isLoading = ref(false);
const route = useRoute();
const snackbar = reactive({
  visible: false,
  message: '',
  status: '',
});

const DATE_FORMAT = 'dd.MM.yyyy H:m';

const startDate = computed(() => {
  return (
    route.query.date &&
    route.query.startTime &&
    parse(
      `${route.query.date} ${route.query.startTime}`,
      DATE_FORMAT,
      new Date(),
    )
  );
});

const endDate = computed(() => {
  return (
    route.query.date &&
    route.query.endTime &&
    parse(`${route.query.date} ${route.query.endTime}`, DATE_FORMAT, new Date())
  );
});

watch(
  () => route.query,
  () => {
    if (!startDate.value || !endDate.value) return;
    fetchCatalogItems(startDate.value, endDate.value);
  },
  { immediate: true },
);

async function fetchCatalogItems(startDate: Date, endDate: Date) {
  isLoading.value = true;
  const { data } = await inventoryItemsApi.getAll({ startDate, endDate });
  inventoryItems.value = data;
  isLoading.value = false;
}

async function reserveItem(reservationItemId: number) {
  snackbar.visible = false;
  snackbar.message = '';
  try {
    if (!startDate.value || !endDate.value) return;
    await reservationsApi.create({
      reservationItemId,
      startDate: startDate.value,
      endDate: endDate.value,
    });
    snackbar.visible = true;
    snackbar.status = 'success';
    snackbar.message = 'Item reserved successfully';
    return fetchCatalogItems(startDate.value, endDate.value);
  } catch (error: any) {
    snackbar.visible = true;
    snackbar.status = 'error';
    snackbar.message =
      error.response?.status === 409
        ? error?.response?.data?.message
        : 'Error reserving item';
  }
}
</script>

<template>
  <div class="py-2 px-8">
    <h1 class="text-center my-5">Find a Space</h1>
    <DashboardFilters :is-loading="isLoading" class="mb-5" />
    <div v-if="startDate && endDate" class="inventory-grid d-flex flex-wrap">
      <InventoryItemCard
        v-for="item in inventoryItems"
        @reserve="reserveItem"
        :key="item.id"
        v-bind="item" />
    </div>
    <div v-else>Please select a date and time to see available spaces.</div>
    <v-snackbar v-model="snackbar.visible" :color="snackbar.status">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.inventory-grid {
  grid-gap: 20px;
}
</style>
