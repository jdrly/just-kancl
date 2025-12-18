<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface Props {
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});
</script>

<template>
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <header class="flex h-16 shrink-0 items-center gap-2">
                <div class="flex items-center gap-2 px-4">
                    <SidebarTrigger class="-ml-1" />
                    <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
                    <Breadcrumb v-if="breadcrumbs.length > 0">
                        <BreadcrumbList>
                            <template v-for="(crumb, index) in breadcrumbs" :key="index">
                                <BreadcrumbItem :class="{ 'hidden md:block': index < breadcrumbs.length - 1 }">
                                    <BreadcrumbLink v-if="crumb.href" :href="crumb.href">
                                        {{ crumb.label }}
                                    </BreadcrumbLink>
                                    <BreadcrumbPage v-else>{{ crumb.label }}</BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator v-if="index < breadcrumbs.length - 1" class="hidden md:block" />
                            </template>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <main class="flex flex-1 flex-col gap-4 p-4 pt-0">
                <slot />
            </main>
        </SidebarInset>
    </SidebarProvider>
</template>
