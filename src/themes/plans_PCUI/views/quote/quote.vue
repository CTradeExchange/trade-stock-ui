<template>
    <router-view />
    <div class='quote'>
        <!-- <TopModule /> -->
        <Ranking />
        <Content />
    </div>
</template>

<script setup>
import { QuoteSocket } from '@/plugins/socket/socket'
import TopModule from './components/TopModule'
import Content from './components/Content'
import Ranking from './ranking'
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
    QuoteSocket.cancel_subscribe(1)
})
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.quote {
    width: 1200px;
    margin: 40px auto;
}
</style>
