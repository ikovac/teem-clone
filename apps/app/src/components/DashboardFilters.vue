<script setup lang="ts">
import { format } from 'date-fns';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

defineProps<{
  isLoading: boolean;
}>();

const router = useRouter();
const date = ref();
const startTime = ref();
const endTime = ref();
const formatDate = (date: Date) => format(date, 'dd.MM.yyyy');

const dateQuery = computed(() => {
  return date.value && formatDate(date.value);
});
const startTimeQuery = computed(() => {
  return (
    startTime.value && `${startTime.value.hours}:${startTime.value.minutes}`
  );
});
const endTimeQuery = computed(() => {
  return endTime.value && `${endTime.value.hours}:${endTime.value.minutes}`;
});
const isDisabled = computed(() => {
  return !date.value || !startTime.value || !endTime.value;
});

const apply = () => {
  router.push({
    name: 'dashboard',
    query: {
      date: dateQuery.value,
      startTime: startTimeQuery.value,
      endTime: endTimeQuery.value,
    },
  });
};
</script>

<template>
  <div class="d-flex flex-wrap align-center flex-column flex-md-row">
    <span class="mb-4 mb-md-0 mr-md-4">Filters: </span>
    <vue-date-picker
      v-model="date"
      :min-date="new Date()"
      :hide-navigation="['time']"
      :format="formatDate"
      placeholder="Select day"
      day-picker
      class="datetime-picker mb-2 mb-md-0 mr-md-2" />
    <vue-date-picker
      v-model="startTime"
      placeholder="Select start time"
      time-picker
      class="datetime-picker mb-2 mb-md-0 mr-md-2" />
    <vue-date-picker
      v-model="endTime"
      placeholder="Select end time"
      time-picker
      class="datetime-picker mb-2 mb-md-0 mr-md-2" />
    <v-btn
      @click="apply"
      :loading="isLoading"
      :disabled="isDisabled"
      color="primary">
      Apply
    </v-btn>
  </div>
</template>

<style scoped>
.datetime-picker {
  max-width: 200px;
}
</style>
