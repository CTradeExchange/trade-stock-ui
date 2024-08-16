<template>
    <div class='page-wrap'>
        <LayoutTop :back='true' :menu='false' :title='$t("trade.trustDetail")' />
        <Loading :show='loading' />
        <div v-if='pendingItem' class='trust-detail'>
            <div class='layout layout-1'>
                <div class='item item-1'>
                    <div class='left'>
                        <div class='name'>
                            <span class='sub direction' :class="Number(pendingItem.direction) === 1 ? 'riseColor' : 'fallColor'">
                                {{ Number(pendingItem.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                            </span>
                        </div>
                        <div class='code'>
                            <p>{{ pendingItem?.symbolName }}</p>
                            <p>{{ pendingItem.symbolCode }}</p>
                        </div>
                    </div>
                    <div class='right'>
                        {{ $tm('stockPendingStatus')[pendingItem.status] }}
                    </div>
                </div>
                <div class='item item-2'>
                    <div class='col'>
                        <div class='sub'>
                            <span v-if='Number(tradeType) === 5'>
                                {{ Number(pendingItem.direction) === 1 ? $t('trade.pendingAmount') + ' ('+ pendingItem.outCurrency +')' : $t('trade.pendingUnit') + ' ('+ pendingItem.outCurrency +')' }}
                            </span>
                            <span v-else-if='Number(tradeType) === 1'>
                                {{ $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' }}
                            </span>
                            <span v-else-if='Number(tradeType) === 3'>
                                {{ Number(pendingItem.entryType) === 1 ? $t('trade.pendingUnit')+ ' (' +pendingItem.accountCurrency + ')' : $t('trade.pendingAmount') + ' ('+pendingItem.accountCurrency + ')' }}
                            </span>
                            <span v-else-if='Number(tradeType) === 6'>
                                {{ $t('trade.pendingUnit')+ '〡' +$t('trade.orderComplete') }}
                            </span>
                            <span v-else>
                                {{ Number(pendingItem.entryType) === 1 ? $t('trade.pendingUnit')+ ' (' +$t('trade.volumeUnit') + ')' : $t('trade.pendingAmount') + ' ('+pendingItem.accountCurrency + ')' }}
                            </span>
                        </div>
                        <div v-if='Number(tradeType) === 6' class='name'>
                            {{ pendingItem.requestNum }} {{ $t('trade.share') }}〡{{ pendingItem.executeNum }}
                        </div>
                        <div v-else class='name'>
                            {{ pendingItem.requestNum }} {{ Number(pendingItem.entryType) === 1 ? $t('trade.volumeUnit') : pendingItem.accountCurrency }}
                        </div>
                    </div><div class='col'>
                        <div class='sub'>
                            {{ $t('trade.trustPrice') }}
                        </div>
                        <div class='name'>
                            {{ pendingItem.requestPrice || '--' }}
                        </div>
                    </div><div class='col'>
                        <div class='sub'>
                            {{ $t('trade.currentPrice') }}
                        </div>
                        <div v-if='Number(tradeType) === 6' class='name' :class='product.cur_color'>
                            {{ product.cur_price || '--' }}
                        </div>
                        <div v-else class='name' :class="Number(pendingItem.direction) === 1 ? 'riseColor' : 'fallColor'">
                            {{ Number(pendingItem.direction) === 1 ? product.buy_price : product.sell_price }}
                        </div>
                    </div>
                </div>
                <div class='item van-hairline--bottom'>
                    <div v-if='[1,2].includes(Number(tradeType))' class='col'>
                        <div class='sub'>
                            {{ $t('trade.stopLossPrice') }}
                        </div>
                        <div class='name'>
                            <span class='number'>
                                {{ shiftedBy(pendingItem.stopLoss,-1*pendingItem.digits ) || '--' }}
                            </span>
                        </div>
                    </div>
                    <div v-if='[1,2].includes(Number(tradeType))' class='col'>
                        <div class='sub'>
                            {{ $t('trade.stopProfitPrice') }}
                        </div>
                        <div class='name'>
                            <span class='number'>
                                {{ shiftedBy(pendingItem.takeProfit,-1*pendingItem.digits ) || '--' }}
                            </span>
                        </div>
                    </div>
                    <div v-if='[3, 9].includes(Number(tradeType))' class='col'>
                        <div class='sub'>
                            {{ $t('trade.loan')+ '(' + pendingItem.accountCurrency + ')' }}
                        </div>
                        <div class='name'>
                            <span class='number'>
                                {{ pendingItem?.loanAmount ? pendingItem.loanAmount + ' ' + pendingItem.accountCurrency : '--' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class='layout layout-3'>
                <div v-if='[1, 2].includes(Number(tradeType))' class='item van-hairline--bottom'>
                    <div class='left'>
                        <div class='title'>
                            {{ $t('trade.expireTime') }}
                        </div>
                    </div>
                    <div class='right'>
                        {{ $t( pendingItem.expireType===1?'trade.expireType1' :'trade.expireType2') }}
                    </div>
                </div>
                <div class='item van-hairline--bottom'>
                    <div class='left'>
                        <div class='title'>
                            {{ $t('trade.pendingTime') }}
                        </div>
                    </div>
                    <div class='right'>
                        {{ formatTime(pendingItem.requestTime) }}
                    </div>
                </div><div class='item'>
                    <div class='left'>
                        <div class='title'>
                            {{ $t('trade.pendingNo') }}
                        </div>
                    </div>
                    <div class='right'>
                        ID : {{ [3,6].includes(Number(tradeType)) ? pendingItem.orderId : pendingItem.id }}
                    </div>
                </div>
            </div>
        </div>
        <div class='submitBox'>
            <van-button size='normal' type='primary' @click='cancelOrder'>
                {{ $t('trade.cancelOrder') }}
            </van-button>
        </div>
    </div>
</template>

<script>
import { Toast, Dialog } from 'vant'
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { shiftedBy } from '@/utils/calculation'
import { QuoteSocket } from '@/plugins/socket/socket'
import { closePboOrder, closeTradePboOrder, stockCancelOrder, queryStockOrderDetail } from '@/api/trade'
import { isEmpty } from '@/utils/util'
import { useI18n } from 'vue-i18n'

export default {
    setup (props) {
        const { t } = useI18n({ useScope: 'global' })
        const router = useRouter()
        const route = useRoute()
        const store = useStore()
        const { id, symbolId, tradeType } = route.query
        const loading = ref(false)

        // 获取挂单详情
        var pendingItem = ref(store.state._trade.pendingMap[`${id}_${tradeType})`])

        // 获取账户信息
        const customInfo = computed(() => store.state._user.customerInfo)
        const symbolKey = `${symbolId}_${tradeType}`
        // 获取当前产品
        const product = computed(() => store.state._quote.productMap[symbolKey])

        const accountIds = computed(() => store.state._user.customerInfo?.accountList.filter(el => el.tradeType === Number(tradeType)).map(el => el.accountId))

        const pendingPrice = computed(() => shiftedBy(pendingItem.value?.requestPrice, -1 * product.value?.price_digits))

        const queryPendingDetail = () => {
            // 查询委托详情
            queryStockOrderDetail({ orderId: id, tradeType }).then(res => {
                if (res.check()) {
                    pendingItem.value = res.data
                }
            })
        }

        watch(() => pendingItem.value, newVal => {
            if (isEmpty(newVal)) {
                queryPendingDetail()
            }
        }, {
            immediate: true
        })

        // 撤单
        const cancelOrder = () => {
            let message, allDeal
            if (Number(tradeType) === 6) {
                if (parseFloat(pendingItem.value.requestNum) === parseFloat(pendingItem.value.executeNum)) {
                    message = t('trade.stockCloseTip1', [pendingItem.value.requestNum, pendingItem.value.symbolName, pendingItem.value.symbolCode])
                    allDeal = 1
                } else {
                    const dealDoneCount = pendingItem.value.requestNum - pendingItem.value.executeNum
                    message = Number(pendingItem.value.executeNum) === 0 ? t('trade.stockCloseTip3', [pendingItem.value.symbolName, pendingItem.value.symbolCode, pendingItem.value.requestNum]) : t('trade.stockCloseTip2', [pendingItem.value.requestNum, pendingItem.value.symbolName, pendingItem.value.symbolCode, pendingItem.value.executeNum, dealDoneCount])
                    allDeal = 0
                }
            } else {
                message = t('trade.cancelPendingOrder')
            }
            Dialog.confirm({
                title: t('tip'),
                message,
                confirmButtonText: t('common.sure'),
                cancelButtonText: t('common.cancel'),
                showCancelButton: allDeal === 0
            }).then(() => {
                loading.value = true
                const params = {
                    tradeType,
                    customerNo: customInfo.value.customerNo,
                    customerId: customInfo.value.id,
                    bizType: pendingItem.value.bizType
                }

                if ([5, 9].includes(Number(tradeType))) {
                    closeTradePboOrder({
                        orderId: pendingItem.value.id,
                        ...params,
                    }).then(res => {
                        loading.value = false
                        if (res.check()) {
                            closeSuccess()
                        }
                    }).catch(err => {
                        loading.value = false
                        console.log(err)
                    })
                } else if (Number(tradeType) === 6) {
                    stockCancelOrder({
                        tradeType: tradeType,
                        bizType: 14,
                        orderId: id
                    }).then(res => {
                        loading.value = false
                        if (res.check()) {
                            closeSuccess()
                        }
                    }).catch(err => {
                        loading.value = false
                        console.log(err)
                    })
                } else {
                    closePboOrder({
                        pboId: pendingItem.value.id.toString(),
                        ...params,
                    }).then(res => {
                        loading.value = false
                        if (res.check()) {
                            closeSuccess()
                        }
                    }).catch(err => {
                        loading.value = false
                        console.log(err)
                    })
                }
            }).catch(() => {})
        }

        const closeSuccess = () => {
            router.back()
            Toast(t('trade.cancelSuccess'))
            queryPBOOrderPage()
        }

        // 获取委托列表
        const queryPBOOrderPage = () => {
            store.dispatch('_trade/queryPBOOrderPage', {
                tradeType,
                customerNo: customInfo.value.customerNo,
                sortFieldName: 'orderTime',
                sortType: 'desc',
                accountIds: accountIds.value + ''
            })
        }

        store.dispatch('_trade/queryPBOOrderPage', {
            tradeType,
            customerNo: customInfo.value.customerNo,
            sortFieldName: 'orderTime',
            sortType: 'desc',
            accountIds: accountIds.value + ''
        })

        onMounted(() => {
            // 订阅报价
            QuoteSocket.send_subscribe([`${symbolId}_${tradeType}`])
        })

        onBeforeUnmount(() => {
            // 取消订阅
            QuoteSocket.cancel_subscribe()
        })

        return {
            pendingItem,
            pendingPrice,
            product,
            loading,
            shiftedBy,
            cancelOrder,
            tradeType

        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.page-wrap {
    padding-top: rem(100px);
    .trust-detail {
        padding: rem(30px) rem(20px) rem(7px) rem(20px);
        .layout {
            margin-bottom: rem(20px);
            background-color: var(--contentColor);
            border-radius: 10px;
            .item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: rem(32px) rem(30px);
                &.item-1 {
                    padding-bottom: 0;
                }
            }
        }
        :deep(.van-button) {
            border-radius: rem(6px);
        }
        :deep(.van-button__text) {
            color: var(--primary);
        }
        :deep(.van-button__mini) {
            width: rem(124px);
            height: rem(48px);
            font-size: rem(24px);
            line-height: rem(48px);
        }
        .layout-1 {
            .item-2 {
                .col {
                    .name {
                        margin-bottom: rem(4px);
                        &.riseColor {
                            color: var(--fallColor);
                        }
                        &.fallColor {
                            color: var(--riseColor);
                        }
                        .number {
                            color: var(--color);
                        }
                    }
                    &:last-child {
                        text-align: right;
                    }
                }
            }
            .left{
                display: flex;
                align-items: center;
            }
            .right{
                color: var(--normalColor);
            }
            .name {
                color: var(--color);
                font-size: rem(28px);

            }
            .code {
                margin-left: rem(20px);
                color: var(--minorColor);
                font-size: rem(20px);
            }
            .sub {
                color: var(--minorColor);
                margin-bottom: rem(10px);
                span {
                    vertical-align: middle;
                }
                .van-icon {
                    margin-right: rem(6px);
                    vertical-align: middle;
                }
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
                &.riseColor{
                    background: var(--riseColor);
                }
                &.fallColor{
                    background: var(--fallColor);
                }
            }
            .active {
                color: #333;
                font-size: rem(28px);
            }
        }
        .layout-3 {
            font-size: rem(28px);
            .left {
                color: #999;

                .title {
                    display: inline-block;
                    margin-right: rem(20px);
                }
                i {
                    position: relative;
                    top: rem(6px);
                    font-size: rem(30px);
                }
            }
            .right {
                color: var(--color);
                text-align: right;
            }
        }
    }
    .submitBox {
        position: absolute;
        bottom: 0;
        left: 0;
        z-index: 2;
        display: flex;
        width: 100%;
        .van-button {
            flex: 1;
            height: rem(90px);
            font-size: rem(30px);
            border: none;
            border-radius: 0;
            &.van-button--default {
                color: var(--primary);
                background: var(--contentColor);
            }
        }
    }
}

</style>
