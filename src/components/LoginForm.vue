<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/composables/useAuth';
import { useTranslations } from '@/composables/useTranslations';

const props = defineProps<{
    class?: HTMLAttributes['class'];
}>();

const router = useRouter();
const { login } = useAuth();
const { t } = useTranslations();

const email = ref('');
const password = ref('');
const error = ref('');
const isSubmitting = ref(false);

async function handleSubmit() {
    error.value = '';
    isSubmitting.value = true;

    try {
        const result = await login(email.value, password.value);
        if (result.success) {
            router.push('/');
        } else {
            error.value = result.error || t('auth.invalidCredentials');
        }
    } catch (e) {
        error.value = t('common.error');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <form :class="cn('flex flex-col gap-6', props.class)" @submit.prevent="handleSubmit">
        <FieldGroup>
            <div class="flex flex-col items-center gap-1 text-center">
                <h1 class="text-2xl font-bold">{{ t('auth.welcomeBack') }}</h1>
                <p class="text-muted-foreground text-sm text-balance">{{ t('auth.loginSubtitle') }}</p>
            </div>

            <div v-if="error" class="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                {{ error }}
            </div>

            <Field>
                <FieldLabel for="email">{{ t('auth.email') }}</FieldLabel>
                <Input id="email" v-model="email" type="email" placeholder="jd@jandrly.cz" required />
            </Field>

            <Field>
                <FieldLabel for="password">{{ t('auth.password') }}</FieldLabel>
                <Input id="password" v-model="password" type="password" required />
            </Field>

            <Button type="submit" :disabled="isSubmitting" class="w-full">
                {{ isSubmitting ? t('auth.loggingIn') : t('auth.loginButton') }}
            </Button>
        </FieldGroup>
    </form>
</template>
