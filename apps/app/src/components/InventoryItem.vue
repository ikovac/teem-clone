<script setup lang="ts">
import roomImg from '@/assets/room.png';
import deskImg from '@/assets/desk.png';
import {
  InventoryItemType,
  type InventoryItem,
  type RoomData,
  type DeskData,
} from '@/models/inventory-item';
import { computed } from 'vue';

const props = defineProps<InventoryItem>();
const $emit = defineEmits<{
  (e: 'reserve', id: number): void;
}>();

const isRoom = computed(() => props.type === InventoryItemType.ROOM);

const imgSrc = computed(() => {
  return isRoom.value ? roomImg : deskImg;
});
</script>

<template>
  <v-card min-width="304">
    <v-card-item>
      <v-card-title>{{ title }}</v-card-title>
    </v-card-item>

    <v-img :src="imgSrc" color="white" contain class="image" />
    <v-card-text>
      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-map-marker" class="mr-2" />
        {{ location.address }} / {{ location.title }}
      </div>
      <div v-if="isRoom" class="d-flex align-center">
        <v-icon icon="mdi-account-group" class="mr-2" />
        {{ (data as RoomData).capacity }}
      </div>
      <div v-else class="d-flex align-center">
        <v-icon icon="mdi-headset-dock" class="mr-2" />
        {{ (data as DeskData).equipment.join(', ') }}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn
        @click="$emit('reserve', id)"
        color="error"
        block
        variant="elevated">
        Reserve
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.image {
  aspect-ratio: 16/9;
}
</style>
