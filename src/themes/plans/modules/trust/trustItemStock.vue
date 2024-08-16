<template>
    <div v-if='product && curProduct' class='trust-item' @click='toDetail'>
        <div class='t-header'>
            <div class='fl'>
                <span class='direction' :class="Number(product.direction) === 1 ? 'riseColor' : 'fallColor'">
                    {{ Number(product.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                </span>
                <span class='name'>
                    {{ product.symbolName }}
                </span>
                <span class='code'>
                    {{ product.symbolCode }}
                </span>
            </div>

            <div class='t-right'>
                <div class='status'>
                    {{ $tm('stockPendingStatus')[product.status] }}
                </div>
                <van-button v-if='Number(showMode) === 1' @click.stop='cancelOrder(product)'>
                    {{ $t('trade.cancelOrder') }}
                </van-button>
            </div>
        </div>

        <div class='t-body'>
            <div class='t-left'>
                <div class='tl-item'>
                    <div class='label'>
                        {{ $t('trade.pendingNumber') }}
                    </div>
                    <span class='val'>
                        {{ product.requestNum }}
                    </span>
                </div>
                <div class='tl-item'>
                    <div class='label'>
                        {{ $t('trade.trustPrice') }}
                    </div>
                    <span class='val'>
                        {{ product.requestPrice }}
                    </span>
                </div>
                <div v-if='Number(showMode) === 1' class='tl-item'>
                    <div class='label'>
                        {{ $t('trade.currentPrice') }}
                        <!-- {{ symbolKey }} -->
                    </div>
                    <span :class='product.cur_color'>
                        {{ getCurPrice(product) }}
                    </span>
                </div>
            </div>
        </div>
        <div v-if='Number(showMode) === 2' class='bottom-info'>
            <span> {{ formatTime(product.requestTime) }}</span>
            <span>#{{ product.orderId }}</span>
        </div>
    </div>
    <Loading :show='loading' />
</template>

<script>
import { computed, ref } from 'vue'
import { Toast, Dialog } from 'vant'
import { shiftedBy } from '@/utils/calculation'
import { useStore } from 'vuex'
import { stockCancelOrder } from '@/api/trade'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
export default {

    props: {
        product: {
            type: Object
        },
        // 显示模式，1 简洁模式 在交易页面显示 2 详情模式 在委托记录显示
        showMode: {
            type: [Number, String],
            default: 1
        }
    },
    // ['product', 'showMode'],
    setup (props) {
        const store = useStore()
        const router = useRouter()
        const route = useRoute()
        const { tradeType } = route.query
        const loading = ref(false)
        const { t } = useI18n({ useScope: 'global' })

        // 获取当前产品
        const symbolKey = `${props.product.symbolId}_${tradeType}`
        const curProduct = computed(() => store.state._quote.productMap[symbolKey])

        const toDetail = () => {
            if (Number(props.showMode) === 1) {
                const orderId = Number(tradeType) === 6 ? props.product.orderId : props.product.id
                router.push({
                    path: '/trustDetail',
                    query: {
                        id: orderId,
                        symbolId: props.product.symbolId,
                        tradeType
                    }
                })
            }
        }

        const cancelOrder = (product) => {
            let message, allDeal
            if (parseFloat(product.requestNum) === parseFloat(product.executeNum)) {
                message = t('trade.stockCloseTip1', [product.requestNum, product.symbolName, product.symbolCode])
                allDeal = 1
            } else {
                const dealDoneCount = product.requestNum - product.executeNum
                message = Number(product.executeNum) === 0 ? t('trade.stockCloseTip3', [product.symbolName, product.symbolCode, product.requestNum]) : t('trade.stockCloseTip2', [product.requestNum, product.symbolName, product.symbolCode, product.executeNum, dealDoneCount])
                allDeal = 0
            }
            Dialog.confirm({
                title: t('tip'),
                message, // t('trade.cancelPendingOrder'),
                confirmButtonText: t('common.sure'),
                cancelButtonText: t('common.cancel'),
                showCancelButton: allDeal === 0
            }).then(() => {
                if (allDeal === 0) closePendingOrder()
            }).catch(() => {})
        }

        // 取消挂单
        const closePendingOrder = () => {
            loading.value = true
            const params = {
                tradeType: props.product.tradeType,
                bizType: 14,
                orderId: props.product.orderId

            }
            stockCancelOrder(params).then(res => {
                loading.value = false
                if (res.check()) {
                    closeSuccess()
                }
            }).catch(err => {
                loading.value = false
                console.log(err)
            })
        }

        const closeSuccess = () => {
            Toast(t('trade.cancelSuccess'))
            document.body.dispatchEvent(new CustomEvent('GotMsg_RefreshAsset'))
            store.dispatch('_trade/queryPBOOrderPage', {
                tradeType: props.product.tradeType,
                sortFieldName: 'orderTime',
                sortType: 'desc',

            })
        }

        const getCurPrice = (product) => {
            const symbolKey = `${product.symbolId}_${product.tradeType}`
            return store.state._quote.productMap[symbolKey]?.cur_price
        }

        return {
            cancelOrder,
            shiftedBy,
            loading,
            curProduct,
            symbolKey,
            toDetail,
            getCurPrice
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.trust-item {
    margin: rem(20px);
    padding: rem(20px);
    background-color: var(--contentColor);
    border-bottom: solid 1px var(--lineColor);
    border-radius: rem(8px);
    font-size: rem(24px);
    .t-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: rem(30px);
        .fl {
            margin-right: rem(32px);
            color: var(--color);
            font-size: rem(30px);
            .name {
                margin-right: rem(10px);
            }
            .code{
                color: var(--minorColor);
                font-size: rem(24px);
            }
            .direction{
                display: inline-block;
                height: rem(36px);
                line-height: rem(40px);
                border-radius: rem(6px);
                color: #fff;
                text-align: center;
                padding: 0 rem(8px);
                font-size: rem(24px);
                margin-right: rem(10px);
                &.riseColor{
                    background: var(--riseColor);
                }
                &.fallColor{
                    background: var(--fallColor);
                }
            }
        }
        .tag {
            // width: 92px;
            display: inline-block;
            height: rem(35px);
            padding: 0 rem(8px);
            color: var(--minorColor);
            font-size: rem(20px);
            line-height: rem(35px);
            text-align: center;
            border: 1px solid var(--minorColor);
            border-radius: rem(6px);
        }
        .t-right {
            display: flex;
            align-items: center;
            .status{
                line-height: rem(50px);
                color: var(--color);
            }
            .van-button {
                width: rem(124px);
                height: rem(48px);
                color: var(--primary);
                font-size: rem(24px);
                margin-left: rem(20px);
                line-height: rem(48px);
                background: var(--primaryAssistColor);
                border-color: var(--primaryAssistColor);
                border-radius: rem(6px);
            }
        }
    }
    .crossLevelNum{
        vertical-align: middle;
        position: relative;
        height: 16px;
        line-height: 14px;
        padding-left: 5px;
        padding-right: 7px;
        font-size: 12px;
        color: var(--color);
        border-radius: 3px;
        border: 1px solid var(--color);
    }
    .directionCell {
        display: flex;
        margin: rem(20px) 0;
        .item {
            flex: 1;
        }
        .orderComplete {
            color: var(--normalColor);
            font-size: rem(20px);
            .label {
                display: inline-block;
                width: rem(100px);
                margin-right: rem(20px);

            }

        }
    }
    .t-body {
        display: flex;
        justify-content: space-between;
        .t-left {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            width: 100%;
            .tl-item {
                width: 33.3%;
                margin-bottom: rem(20px);
                color: var(--normalColor);
                text-align: left;
                label {
                    display: inline-block;
                    width: rem(180px);
                    margin-right: rem(20px);
                    overflow: hidden;
                    font-size: rem(20px);
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                }
                .label {
                    color: var(--minorColor);
                     margin-bottom: rem(10px);
                }
                .val{
                    color: var(--color);
                }
                span {
                    text-align: left;
                    vertical-align: middle;
                }
                &:nth-child(2n) {
                    text-align: center;
                }
                &:last-child {
                    text-align: right;
                }
            }
        }
    }
    .bottom-info{
        display: flex;
        justify-content: space-between;
        color:var(--minorColor)
    }
}
</style>
