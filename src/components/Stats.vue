<script setup lang="ts">
</script>

<template>
    <div class="bg-gray-900">
        <div class="mx-auto max-w-7xl">
            <div class="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
                <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
                    <p class="text-sm font-medium leading-6 text-gray-400">Status</p>
                    <p class="mt-2 flex items-baseline gap-x-2">
                        <span class="text-4xl font-semibold tracking-tight text-white">idle</span>
                    </p>
                </div>
                <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
                    <p class="text-sm font-medium leading-6 text-gray-400">Number of rounds being synced</p>
                    <p class="mt-2 flex items-baseline gap-x-2">
                        <span class="text-4xl font-semibold tracking-tight text-white">4</span>
                        <span class="text-sm text-gray-400">mins</span>
                    </p>
                </div>
                <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
                    <p class="text-sm font-medium leading-6 text-gray-400">Number of games sent</p>
                    <p class="mt-2 flex items-baseline gap-x-2">
                        <span class="text-4xl font-semibold tracking-tight text-white">3</span>
                    </p>
                </div>
                <div class="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
                    <p class="text-sm font-medium leading-6 text-gray-400">Number of moves sent</p>
                    <p class="mt-2 flex items-baseline gap-x-2">
                        <span class="text-4xl font-semibold tracking-tight text-white">98</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
    <div class="bg-white mt-4 p-4">
        [logs here]
    </div>
</template>
