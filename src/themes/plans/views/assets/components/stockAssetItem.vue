<template>
    <div class='totalAssets'>
        <!-- v-if='assetsInfo && assetsInfo.totalBalance>0' -->
        <div class='totalAssetsBlock'>
            <div class='totalAssetsInfo'>
                <p class='label'>
                    <span> {{ $t('assets.assetsEquity') }}({{ currency }}) </span>
                    <span class='tag'>
                        <i class='icon_zijinmingxi' @click="$router.push({ name:'Record',query:{ tradeType:6, accountId:activeCurrencyId } })"></i>
                    </span>
                </p>
                <p class='totalAmount'>
                    {{ userAccount[currency]?.netAsset || '--' }}
                </p>
            </div>
        </div>
        <ul class='assetList'>
            <li class='item'>
                <p class='muted'>
                    {{ $t('assets.stockSecurities') }}
                </p>
                <p> {{ userAccount[currency]?.stockAsset || '--' }} </p>
                <!-- stockAsset -->
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('assets.balace') }}
                </p>
                <p> {{ userAccount[currency]?.balance || '--' }}  </p>
                <!-- balance -->
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('assets.positionProfit') }}
                </p>
                <p>{{ userAccount[currency]?.profitLoss || '--' }} </p>
                <!-- ProfitLoss -->
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('assets.cashCanWithdraw') }}
                </p>
                <p>{{ userAccount[currency]?.cash ||'--' }}  </p>
                <!-- cash -->
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('assets.maxBuy') }}
                </p>
                <p>{{ userAccount[currency]?.maxBuy || '--' }}</p>
                <!-- maxBuy -->
            </li>
            <li class='item'>
                <p class='muted'>
                    {{ $t('assets.risk') }}
                </p>
                <p :class="'risk-level'+ userAccount[currency]?.risk">
                    {{ RISKENUM[userAccount[currency]?.risk] }}
                </p>
                <!-- risk -->
            </li>
        </ul>

        <div v-if='$store.state._base.plans.length>1' class='btns'>
            <van-button
                size='mini'
                @click='toTransfer'
            >
                {{ $t('trade.transfer') }}
            </van-button>
        </div>
    </div>
    <PositionList :currency='currency' />
</template>

<script setup>
import { computed, defineProps, watchEffect } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import PositionList from '@plans/modules/positionList/positionList'
import { isEmpty } from '@/utils/util'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const props = defineProps({
    activeCurrencyId: Number
})

const store = useStore()
const router = useRouter()

const assetsInfo = computed(() => store.state._user.customerInfo.accountList.find(el => Number(el.tradeType) === 6))

const asset = computed(() => store.state._user.customerInfo.accountList.find(el => Number(el.accountId) === props.activeCurrencyId))

const currency = computed(() => store.state._user.customerInfo.accountList.find(el => Number(el.accountId) === props.activeCurrencyId)?.currency)

const userAccount = computed(() => store.state._user.accountAssets[6] || {})

const customerInfo = computed(() => store.state._user.customerInfo)

// 风险等级枚举
const RISKENUM = {
    1: t('riskLevel.safety'),
    2: t('riskLevel.warn'),
    3: t('riskLevel.danger'),
}

// 跳转划转记录
const toTransfer = () => {
    router.push({
        path: '/transfer',
        query: {
            accountId: props.activeCurrencyId,
            tradeType: 6
        }
    })
}

// 获取持仓列表
const queryPositionList = () => {
    if (isEmpty(customerInfo.value) || Number(props.activeCurrencyId) === 0) {
        return
    }

    store.dispatch('_trade/queryPositionPage', {
        tradeType: 6,
        sortFieldName: 'openTime',
        sortType: 'desc',
        accountId: props.activeCurrencyId
    }).then(res => {
        if (res.check()) {

            // sendSubscribe(res.data)
        }
    }).catch(() => {

    }).finally(() => {
        // 订阅资产数据
        // MsgSocket.subscribedListAdd(function () {
        //     MsgSocket.subscribeAsset(tradeType)
        // })
    })
}

watchEffect(() => {
    if (props.activeCurrencyId !== 0) {
        queryPositionList()
    }
})

</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.totalAssets {
    margin-top: rem(30px);
    padding: rem(10px) rem(30px) rem(30px) rem(30px);
    background: var(--contentColor);
    border-radius: rem(10px);
    border: solid 1px var(--lineColor);
}
.totalAssetsBlock {
    margin-bottom: rem(40px);
}
.totalAssetsInfo {
    font-size: rem(28px);
    .label {
        display: flex;
        justify-content: space-between;
        height: rem(46px);
        margin-top: rem(20px);
        color: var(--minorColor);
        font-size: rem(28px);
        line-height: rem(46px);
        .tag {
            color: var(--normalColor);
            font-size: rem(38px);
        }
    }
    .totalAmount {
        margin-top: rem(10px);
        color: var(--color);
        font-size: rem(70px);
        letter-spacing: rem(-2px);
        letter-spacing: rem(-2px);
        word-break: break-all;
    }
}
.assetList {
    display: flex;
    flex-flow: row wrap;
    grid-template-columns: auto auto auto;
    align-content: flex-start;
    justify-content: space-around;
    font-size: rem(34px);
    line-height: 1.5;
    .item {
        flex: 33.3% 1;
        margin-bottom: rem(30px);
    }
    .muted {
        font-size: rem(24px);
    }
    .risk-level1{
        color: var(--success);
    }
    .risk-level2{
        color: var(--focusColor);
    }
    .risk-level3{
        color: var(--warn);
    }
}
.btns {
    display: flex;
    height: rem(65px);
    .van-button {
        display: block;
        width: 100%;
        height: 100%;
        margin-right: rem(20px);
        color: var(--primary);
        font-size: rem(28px);
        line-height: rem(65px);
        background: none;
        border: solid 1px var(--primary);
        border-radius: rem(6px);
        &:last-child {
            margin-right: 0;
        }
    }
}
</style>
