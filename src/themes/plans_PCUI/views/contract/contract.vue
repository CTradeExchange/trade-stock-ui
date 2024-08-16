<template>
    <centerViewDialog class='contractPage'>
        <template v-if='tradeType == 6'>
            <StockContract />
        </template>
        <template v-else>
            <contractComp />
        </template>
    </centerViewDialog>
</template>

<script>
import centerViewDialog from '@planspc/layout/centerViewDialog'
import contractComp from './components/contractComp'
import StockContract from './components/stockContract'
import { useRoute } from 'vue-router'

export default {
    components: {
        centerViewDialog,
        StockContract,
        contractComp
    },
    setup () {
        const route = useRoute()
        const { tradeType } = route.query

        return {
            tradeType
        }
    }
}
</script>

<style lang="scss">
@import '@/sass/mixin.scss';
.contractPage {
    line-height: 50px;
}
</style>
