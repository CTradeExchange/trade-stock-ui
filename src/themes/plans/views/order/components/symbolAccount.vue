<template>
    <div v-if='isHKD || isUSD' class='symbolAccount'>
        <p v-if='isHKD'>
            {{ $t('tradeAccount.HKD') }}
        </p>
        <p v-else-if='isUSD'>
            {{ $t('tradeAccount.USD') }}
        </p>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    product: {
        type: Object,
        default: () => ({})
    }
})

const isHKD = computed(() => {
    return props.product.labels?.toLowerCase().split(',').includes('hk-stock')
})

const isUSD = computed(() => {
    return props.product.labels?.toLowerCase().split(',').includes('us-stock')
})
</script>

<style lang="scss" scoped>
.symbolAccount {
    height: rem(88px);
    line-height: rem(88px);
    background: var(--contentColor);
    margin-bottom: rem(20px);
    padding: 0 rem(20px);
}
</style>
