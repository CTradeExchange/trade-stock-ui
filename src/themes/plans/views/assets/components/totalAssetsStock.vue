<template>
    <div class='total-asset'>
        <div class='top-info'>
            <span>
                {{ $t('assets.netAssets') }}
            </span>
            <van-popover v-model:show='showPopover' :actions='actions' @select='onSelect'>
                <template #reference>
                    <span>
                        ({{ currentCurrency }})
                    </span>
                    <!-- <van-icon name='arrow-down' /> -->
                    <span class='arrow-down'></span>
                </template>
            </van-popover>

            <span
                class='icon-eye'
                :class='[assetVisible ? "icon_icon_pressed" : "icon_icon_default"]'
                href='javascript:;'
                @click='assetVisible=!assetVisible'
            ></span>
        </div>
        <p class='total-val'>
            {{ assetVisible ? (userAccount[currentCurrency]?.conNetAsset || '--') : '∗∗∗∗∗∗∗' }}
        </p>
        <i
            class='icon_zijinmingxi'
            @click="$router.push({ name:'Record',query:{ tradeType:6,accountId: 0 } })"
        ></i>
    </div>
    <div class='assets-list'>
        <van-cell
            v-for='(item,index) in accountList'
            :key='index'
            is-link
            :value='assetVisible ? userAccount[item.currency]?.netAsset : "∗∗∗∗∗"'
            @click='handleTabClick(item)'
        >
            <template #title>
                {{ $tm("assets.stock")[item.currency] }}
                <strong>({{ item.currency }})</strong>
            </template>
        </van-cell>
        <div v-if='$store.state._base.plans.length>1' class='btns'>
            <van-button
                class='transfer-btn'
                size='mini'
                @click='toTransfer'
            >
                {{ $t('trade.transfer') }}
            </van-button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, defineEmits, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { MsgSocket } from '@/plugins/socket/socket'

const store = useStore()
const router = useRouter()
const assetVisible = ref(false)
const showPopover = ref(false)
const currentCurrency = ref('')

const accountList = computed(() => store.state._user.customerInfo.accountList.filter(el => Number(el.tradeType) === 6))
const actions = computed(() => accountList.value.map(el => { return { text: el.currency } }))
const accountId = computed(() => store.state._user.customerInfo.accountList.find(el => el.currency === currentCurrency.value)?.accountId)
const userAccount = computed(() => store.state._user.accountAssets[6] || {})

const onSelect = currency => {
    currentCurrency.value = currency.text
}
// 跳转划转记录
const toTransfer = () => {
    router.push({
        path: '/transfer',
        query: {
            accountId: accountId.value,
            tradeType: 6
        }
    })
}
const handleTabClick = (account) => {
    router.push({
        path: '/assetsInfo',
        query: {
            accountId: account.accountId,
            currency: account.currency,
            tradeType: 6
        }
    })
}

watchEffect(() => {
    if (actions.value.length > 0) {
        currentCurrency.value = actions.value[0].text
    }
})

// 订阅资产数据
MsgSocket.subscribedListAdd(function () {
    const subscribeParam = {
        tradeTypes: '6',
        subscribeType: '1,2'
    }

    MsgSocket.subscribeAsset(subscribeParam)
})

</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.total-asset{
    position: relative;
    margin-top: rem(30px);
    height: rem(300px);
    border-radius: rem(10px);
    border: solid 1px var(--lineColor);
    display: flex;
    flex-direction: column;
    background: var(--contentColor);
    justify-content: center;
    align-items: center;
    .top-info{
        font-size: rem(32px);
        color: var(--minorColor);
        .icon-eye{
            font-size: rem(40px);
            margin-left: rem(20px);
            vertical-align: middle;
        }
    }
    .arrow-down{
        vertical-align: middle;
        display: inline-block;
        @include triangle(down,10px,6px,var(--normalColor));
    }
    .total-val{
        font-size: rem(70px);
        // font-weight: bold;
        padding-top: rem(30px);
    }
    .icon_zijinmingxi{
        position: absolute;
        right: rem(30px);
        top: rem(35px);
        font-size: rem(38px);
        color: var(--normalColor);
    }
}
.assets-list{
    background: var(--contentColor);
    border-radius: rem(10px);
    margin-top: rem(30px);
    --van-cell-line-height: 45px;
    :deep(.van-cell){
        //line-height: rem(85px);
        .van-cell__right-icon{
            margin-top: -2px;
        }
        .van-cell__title {
            flex: 1;
        }
        .van-cell__value {
            flex: none;
        }
    }
}
.btns {
    display: flex;
    //height: rem(120px);
    padding: rem(40px) rem(30px);
    :deep(.van-button) {
        display: block;
        width: 50%;
        height: 100%;
        margin-right: rem(20px);
        font-size: rem(28px);
        line-height: rem(70px);
        border: none;
        border-radius: rem(6px);
        &:last-child {
            flex: 1;
            margin-right: 0;
        }
        &.transfer-btn {
            color: var(--primary);
            background: none;
            border: solid 1px var(--primary);
        }
    }
}
</style>
