<template>
    <template v-if='tradeType == 6'>
        <StockContract />
    </template>
    <template v-else>
        <Contract />
    </template>
</template>

<script>
import { useStore } from 'vuex'
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StockContract from './stockContract'
import Contract from './contract'

export default {
    components: {
        Contract,
        StockContract
    },
    setup () {
        const store = useStore()
        const router = useRouter()
        const route = useRoute()
        const { symbolId, tradeType } = route.query
        const product = computed(() => store.state._quote.productMap[`${symbolId}_${tradeType}`])
        // 初始化产品详情
        onMounted(() => {
            if (product.value) {
                store.dispatch('_quote/querySymbolInfo', { symbolId, tradeType, forceQuery: true })
            } else {
                router.replace('/')
            }
        })
        return {
            symbolId,
            tradeType
        }
    }

}
</script>
