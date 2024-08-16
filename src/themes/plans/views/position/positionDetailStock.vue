<template>
    <div class='page-wrap'>
        <LayoutTop
            :custom-style='{
                "background": $style.bgColor
            }'
            :title='positionData?.symbolName'
        >
            <template #right>
                <i class='icon_tubiao hidden' @click='toProduct(positionData.symbolId)'></i>
            </template>
        </LayoutTop>
        <div v-if='positionData' class='main'>
            <div class='m-orderInfo'>
                <div class='layout layout-1'>
                    <div class='item item-2'>
                        <div class='col'>
                            <div class='sub alignLeft'>
                                {{ $t('trade.profit') }}({{ assetsInfo?.currency }})
                            </div>
                            <div class='name profit' :class="parseFloat(positionData?.profitLoss) > 0 ? 'riseColor': 'fallColor'">
                                {{ positionData?.profitLoss || '--' }}
                            </div>
                        </div>
                    </div>

                    <div class='btns'>
                        <div class='item-btn' @click.stop='toOrder("buy")'>
                            {{ $t('trade.buy') }}
                        </div>
                        <div class='item-btn' @click.stop='toOrder("sell")'>
                            {{ $t('trade.sell') }}
                        </div>
                    </div>
                </div>
                <div class='layout layout-1'>
                    <div class='header van-hairline--bottom'>
                        <div class='col'>
                            <span class='sub direction' :class="Number(positionData?.direction) === 1 ? 'riseColor' : 'fallColor'">
                                {{ Number(positionData?.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                            </span>
                            <span class='name'>
                                {{ positionData.openNum }} {{ $t('trade.share') }}
                            </span>
                        </div>
                    </div>
                    <div class='item item-2 van-hairline--bottom'>
                        <div class='col'>
                            <div class='sub'>
                                {{ $t('trade.cost') }}
                            </div>
                            <div class='name'>
                                {{ positionData?.costPrice || '--' }}
                            </div>
                        </div>
                        <div class='col alignRight'>
                            <div class='sub'>
                                {{ $t('trade.currentPrice') }}
                            </div>
                            <div class='name' :class='product.cur_color'>
                                {{ product.cur_price || '--' }}
                            </div>
                        </div>
                        <div class='col alignRight'>
                            <div class='sub'>
                                {{ $t('trade.marketValue') }}
                            </div>
                            <div class='name'>
                                {{ getMarketValue(product.cur_price,positionData.openNum) }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class='layout layout-1'>
                    <div class='header'>
                        {{ $t('trade.stockDealList') }}
                    </div>
                    <div class='detail-list'>
                        <ul class='header'>
                            <li>{{ $t('trade.dealTime') }}</li>
                            <li>{{ $t('trade.dealAvgPrice') }}</li>
                            <li>{{ $t('trade.dealVolume') }}</li>
                            <li>{{ $t('trade.orderAmount') }}</li>
                        </ul>

                        <ul
                            v-for='(item,index) in detailList'
                            :key='index'
                            class='data'
                        >
                            <li>
                                <p class='direct'>
                                    {{ Number(item.direction) === 1 ? $t('trade.buy') : $t('trade.sell') }}
                                </p>
                                <p class='date'>
                                    {{ formatDate(item.executeTime) }}
                                </p>
                                <p class='time'>
                                    {{ formatTime(item.executeTime) }}
                                </p>
                            </li>
                            <li>{{ item.executePrice }}</li>
                            <li>{{ item.executeNumber }}</li>
                            <li>{{ item.executeAmount }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { reactive, toRefs, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { MsgSocket, QuoteSocket } from '@/plugins/socket/socket'
import { minus, mul } from '@/utils/calculation'
import { queryStockPosition } from '@/api/trade'
export default {

    setup (props) {
        const store = useStore()
        const route = useRoute()
        const router = useRouter()
        const state = reactive({
            detailList: []
        })

        const { orderId, positionId, symbolId, tradeType } = route.query

        const assetsInfo = computed(() => store.state._user.customerInfo.accountList.find(el => Number(el.tradeType) === Number(tradeType)))

        const positionData = computed(() => store.state._trade.positionMap[positionId + '_' + tradeType])

        const product = computed(() => store.state._quote.productMap[symbolId + '_' + tradeType])

        const positionVolume = computed(() => minus(positionData.value?.openVolume, positionData.value?.closeVolume))
        const style = computed(() => store.state.style)

        const btnBg = style.value.primary + '0D'
        // 初始化设置
        const init = () => {
            QuoteSocket.send_subscribe([product.value.symbolKey])
            // 订阅资产数据
            MsgSocket.subscribedListAdd(function () {
                MsgSocket.subscribeAsset({ tradeTypes: tradeType, subscribeType: '1' })
            })
            if (!product.value?.minVolume) {
                // 获取产品详情
                store.dispatch('_quote/querySymbolInfo', {
                    symbolId,
                    tradeType: tradeType
                })
            }
            // 订阅报价
            if (positionId && !positionData.value?.positionId) {
                store.dispatch('_trade/queryPositionPage', {
                    tradeType: tradeType,
                    accountId: positionData.accountId,
                })
            }
            // 查询成交明细
            queryDetailList()
        }

        const getMarketValue = (price, count) => {
            return mul(price, count)
        }

        const queryDetailList = () => {
            queryStockPosition({
                positionId,
                tradeType: 6
            }).then(res => {
                if (res.check()) {
                    state.detailList = res.data
                }
            })
        }

        const formatDate = (val) => {
            return window.dayjs(val).format('YYYY-MM-DD')
        }

        const formatTime = (val) => {
            return window.dayjs(val).format('HH:mm:ss')
        }

        const toProduct = (symbolId) => {
            router.push({ path: '/product', query: { symbolId, tradeType } })
        }

        const toOrder = direction => {
            router.push({ path: '/order', query: { symbolId, tradeType: 6, direction } })
        }

        store.commit('_quote/Update_productActivedID', symbolId + '_' + tradeType)

        onMounted(() => {
            init()
        })

        onBeforeUnmount(() => {
            MsgSocket.cancelSubscribeAsset()
        })

        return {
            ...toRefs(state),
            positionVolume,
            product,
            positionData,
            orderId,
            assetsInfo,
            positionId,
            toProduct,
            btnBg,
            toOrder,
            formatDate,
            formatTime,
            getMarketValue,

        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.page-wrap {
    position: relative;
    height: 100%;
    padding-top: 1.2rem;
    font-size: 0.37333rem;
    background: var(--bgColor);
    .m-orderInfo {
        padding: rem(20px) rem(20px) 0 rem(20px);
        .layout {
            padding: 0 rem(30px) 0;
            margin-bottom: rem(20px);
            background-color: var(--contentColor);
            border-radius: 10px;
            .item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 0 rem(40px);
                &.item-1 {
                    padding-bottom: 0;
                }
            }
            .header{
                font-weight: bold;
                padding-bottom: rem(30px);
                padding-top: rem(30px);
                li{
                    width: 25%;
                    text-align: right;
                    font-size: rem(24px);
                    &:first-child{
                        text-align: left;
                    }
                }
            }
            .detail-list{
                .header{
                    display: flex;
                    justify-content: space-between;
                }
                .data{
                    padding: rem(16px) 0;
                    border-top: solid 1px var(--lineColor);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    .direct{
                        margin-bottom: rem(10px);
                    }
                    .time{
                        font-size: rem(24px);
                    }
                    li{
                        font-size: rem(24px);
                        width: 25%;
                        text-align: right;
                        .date{
                            margin-bottom: rem(8px);
                        }
                        &:first-child{
                            text-align: left;
                        }
                    }
                }
            }
        }
        :deep(.van-button) {
            border-radius: rem(6px);
        }
        :deep(.van-button__text) {
            color: var(--primary);
        }
        :deep(.van-button__text) {
            width: rem(124px);
            height: rem(48px);
            font-size: rem(24px);
            line-height: rem(48px);
        }
        .layout-1 {
            .item-2 {
                padding-top: rem(30px);
                .col {
                    .name {
                        margin-bottom: rem(4px);
                        .number {
                            color: var(--minorColor);
                        }
                    }
                    :nth-child(1n) {
                        .name {
                            text-align: left;
                        }
                    }
                }
            }
            .btns{
                padding-bottom: rem(30px);
                display: flex;
                justify-content: space-between;
                .item-btn{
                    height: rem(56px);
                    line-height: rem(56px);
                    border-radius: rem(6px);
                    background: v-bind(btnBg);
                    color: var(--primary);
                    flex: 1;
                    text-align: center;
                    margin-right: rem(25px);
                    &:last-child{
                        margin-right: 0;
                    }
                }
            }
            .name {
                font-size: rem(28px);
                &.lx{
                    font-size: rem(34px);
                }
                &.profit{
                    font-size: rem(70px);
                }
            }
            .code {
                color: var(--minorColor);
                font-size: rem(20px);
            }
            .sub {
                color: var(--minorColor);
                font-size: rem(28px);
                margin-bottom: rem(10px);
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
            .active {
                color: var(--color);
                font-size: rem(28px);
            }
        }
    }
}

</style>
