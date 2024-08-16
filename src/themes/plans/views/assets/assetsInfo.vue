<template>
    <template v-if='tradeType == 6'>
        <AssetsInfoStock />
    </template>
    <template v-else>
        <AssetsInfo />
    </template>
</template>

<script>
import { onMounted, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import AssetsInfo from './components/assetsInfo'
import AssetsInfoStock from './components/assetsInfoStock'

export default {
    components: {
        AssetsInfo,
        AssetsInfoStock
    },
    setup () {
        const store = useStore()
        const route = useRoute()
        const state = reactive({
            tradeType: route.query.tradeType,
            currency: route.query.currency,
            accountId: route.query.accountId
        })
        onMounted(() => {
            if (state.tradeType !== '6') {
                store.dispatch('_user/queryAccountAssetsInfo', {
                    tradeType: state.tradeType,
                    accountId: parseInt(state.accountId)
                })
            }
        })

        return {
            ...toRefs(state),
        }
    }
}
</script>
