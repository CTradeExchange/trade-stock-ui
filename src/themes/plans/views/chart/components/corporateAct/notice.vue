<template>
    <div v-if='list.length > 0' class='act-notice'>
        <van-notice-bar
            background='var(--contentColor)'
            color='var(--normalColor)'
            :text='$t("corporateAct.exDividend") + ": " + list[0].actionInfo'
        />
    </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
    setup () {
        const store = useStore()
        const list = computed(() => {
            return (store.getters.productActived?.tradeType === 6 && store.getters.productActived?.dividendFutureInfos) || []
        })
        return {
            list
        }
    }
}
</script>

<style lang="scss" scoped>
.act-notice{
    .van-notice-bar {
        padding: 0 rem(15px);
        height: rem(50px);
        font-size: rem(22px);
    }
}

</style>
