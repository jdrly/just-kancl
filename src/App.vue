<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useConvexQuery } from 'convex-vue';
import { api } from '../convex/_generated/api';

const { data, isPending } = useConvexQuery(api.tasks.get);
</script>

<template>
    <h1>You did it!</h1>
    <Button>Click me</Button>
    <p>Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the documentation</p>
    <span v-if="isPending"> Loading... </span>
    <ul v-else>
        <li v-for="todo in data" :key="todo._id">{{ todo.text }} {{ todo.isCompleted ? '☑' : '☐' }}</li>
    </ul>
</template>

<style scoped></style>
