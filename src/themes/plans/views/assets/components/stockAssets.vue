<template>
    <div class='stock-asset-wrap'>
        <van-tabs
            v-model:active='active'
            :color='$style.primary'
            shrink
            @click-tab='onClickTab'
        >
            <van-tab name='all' :title="$t('assets.overview')" />
            <van-tab
                v-for='(item,index) in accountList'
                :key='index'
                :name='item.accountId'
                :title='$tm("assets.stock")[item.currency]'
            />
        </van-tabs>
        <total-assets-stock
            v-if='active === "all"'
        />
        <stock-asset-item
            v-else
            :active-currency-id='activeCurrencyId'
        />
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useStore } from 'vuex'
import totalAssetsStock from './totalAssetsStock.vue'
import stockAssetItem from './stockAssetItem.vue'
const active = ref('')
const activeCurrencyId = ref(0)

const store = useStore()
const accountList = computed(() => store.state._user.customerInfo.accountList.filter(el => Number(el.tradeType) === 6))

const onClickTab = val => {
    activeCurrencyId.value = val.name
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.stock-asset-wrap{
    //--van-tabs-bottom-bar-width: 30px;
}
</style>
