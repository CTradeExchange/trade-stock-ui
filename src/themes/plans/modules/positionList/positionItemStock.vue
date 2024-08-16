<template>
    <div class='product-item'>
        <div class='item' :data='activeNames'>
            <van-collapse
                v-model='activeNames'
                class='activeNames'
            >
                <van-collapse-item :name='data.positionId'>
                    <template #title>
                        <div class='cell'>
                            <div class='th'>
                                <div class='tl'>
                                    <span class='name'>
                                        {{ data.symbolName }}
                                    </span>
                                    <span v-if='isHK' class='stock-tag hk'>
                                        HK
                                    </span>
                                    <span v-else-if='isUS' class='stock-tag us'>
                                        US
                                    </span>
                                    <!-- <span v-for="item in data.symbolLabels.split(',')" :key='item' class='stock-tag'>
                                        {{ TAGENUM[data.symbolLabels] }}
                                    </span> -->

                                    <span class='lot'>
                                        {{ data.symbolCode }}
                                    </span>
                                    <i class='icon_-gupiao hidden' @click.stop='toProduct(data.symbolId)'></i>
                                    <span v-if='data.crossLevelNum' class='multipleVal' :class="{ arrow: data.marginSetType==='2' }" @click.stop='data.marginSetType==="2" ? $emit("showMultiplePopup",data):""'>
                                        <i>{{ data.crossLevelNum }}x</i>
                                        <i v-if="data.marginSetType==='2'" class='icon_icon_arrow'></i>
                                    </span>
                                </div>
                            </div>
                            <div class='block'>
                                <div class='bleft'>
                                    <span class='direction' :class="Number(data.direction) === 1 ? 'riseColor' : 'fallColor'">
                                        {{ Number(data.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                                    </span>
                                    <span>{{ data.openNum }} {{ $t('trade.share') }}</span>
                                </div>
                                <div class='bright'>
                                    <div class='ft amount' :class="{ 'riseColor': parseFloat(data.profitLoss) > 0, 'fallColor': parseFloat(data.profitLoss) < 0 }">
                                        <span> {{ data.profitLoss || '--' }}</span>&nbsp;&nbsp;<!-- {{ data.profitLoss }} {{ customerInfo.currency }} -->
                                        <span>{{ data.profitLossPercent || '--' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div class='cell' @click.stop='toPositionDetail(data)'>
                        <div class='flex-wrap'>
                            <div class='flex-item'>
                                <div class='title'>
                                    {{ $t('trade.cost') }}
                                </div>
                                <div class='val'>
                                    {{ data.costPrice || '--' }}
                                </div>
                            </div>
                            <div class='flex-item alignRight'>
                                <div class='title'>
                                    {{ $t('trade.currentPrice') }}
                                </div>
                                <div class='cur-price' :class='product.cur_color'>
                                    {{ product.cur_price || '--' }}
                                </div>
                            </div>
                            <div class='flex-item alignRight'>
                                <div class='title'>
                                    {{ $t('trade.marketValue') }}
                                </div>
                                <div class='val'>
                                    {{ getMarketValue(data) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class='cell'>
                        <div class='ft'>
                            <van-button
                                size='mini'
                                type='default'
                                @click.stop='toOrder(data,"buy")'
                            >
                                {{ $t('trade.buy') }}
                            </van-button>
                            <van-button
                                size='mini'
                                type='default'
                                @click.stop='toOrder(data,"sell")'
                            >
                                {{ $t('trade.sell') }}
                            </van-button>
                        </div>
                    </div>
                </van-collapse-item>
            </van-collapse>
        </div>
    </div>
</template>

<script>
import { computed, reactive, toRefs, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { minus, mul, toFixed } from '@/utils/calculation'
export default {
    props: ['data'],
    setup ({ data }) {
        const store = useStore()
        const router = useRouter()
        const state = reactive({
            show: false,
            loading: false,
            cur: {},
            cpVis: false,
            activeNames: []
        })
        const TAGENUM = {
            'us-stock': 'US',
            'hk-stock': 'HK',
        }
        // 获取玩法列表
        const plans = computed(() => store.state._base.plans)
        const tradeType = computed(() => store.state._quote.curTradeType || plans.value[0].id)
        const customerInfo = computed(() => store.state._user.customerInfo)
        const positionList = computed(() => store.state._trade.positionList[tradeType.value])
        const product = computed(() => store.state._quote.productMap[data.symbolId + '_' + tradeType.value])
        const labels = computed(() => product.value.labels?.toLowerCase().split(',') || [])
        const isUS = computed(() => labels.value.includes('us-stock'))
        const isHK = computed(() => labels.value.includes('hk-stock'))
        const btnBg = computed(() => store.state.style.primary + '0D')

        const toPositionDetail = (item) => {
            store.commit('_quote/Update_productActivedID', item.symbolId)
            router.push({
                path: '/positionDetailStock',
                query: {
                    symbolId: item.symbolId,
                    positionId: item.positionId,
                    tradeType: item.tradeType
                }
            })
        }
        const updateShow = (val) => {
            state.cpVis = val
        }

        const toProduct = (symbolId) => {
            router.push({ path: '/product', query: { symbolId, tradeType: tradeType.value } })
        }

        const toOrder = (data, direction) => {
            router.push({ path: '/order', query: { symbolId: data.symbolId, tradeType: tradeType.value, direction } })
        }
        const getMarketValue = (data) => {
            const val = mul(product.value.cur_price, data.openNum)
            return toFixed(val, 2)
        }

        watchEffect(() => {
            if (positionList.value?.length > 0) {
                state.activeNames = positionList.value.map(item => item.positionId)
            }
        })

        return {
            ...toRefs(state),
            positionList,
            customerInfo,
            product,
            toPositionDetail,
            updateShow,
            toProduct,
            minus,
            btnBg,
            tradeType,
            toOrder,
            isUS,
            isHK,
            TAGENUM,
            getMarketValue
        }
    }
}
</script>

<style lang='scss' scoped>
@import '@/sass/mixin.scss';
.product-item {
    .item {
        position: relative;
        //height: rem(100px);
        //margin-bottom: rem(20px);
        overflow: hidden;
        background: var(--contentColor);
        border-bottom: solid rem(1px) var(--lineColor);
        border-radius: rem(10px);
        :deep(.van-collapse-item__title) {
            padding: rem(20px) rem(30px) 0 rem(30px);
            .van-cell__right-icon {
                color: var(--color);
                vertical-align: middle;
                position: absolute;
                right: rem(30px);
            }
        }
        :deep(.van-collapse) {
            .van-cell {
                &::after {
                    border: none;
                }
            }
            &::after {
                border: none;
            }
        }
        .cell {
            width: 100%;
            margin-bottom: rem(20px);
            color: var(--color);
            font-size: rem(24px);
            line-height: 1.45;
            .th {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                margin-bottom: rem(30px);
            }
            &:last-child {
                align-items: flex-end;
            }
            .bd {
                position: relative;
                display: inline-block;
                //margin-right: rem(15px);
                text-align: center;
            }
            .block{
                display: flex;
                justify-content: space-between;
                align-items: center;
                .bleft{
                    font-size: rem(28px);
                    .direction{
                        display: inline-block;
                        padding: 0 rem(4px);
                        height: rem(30px);
                        line-height: rem(32px);
                        border-radius: rem(6px);
                        color: #fff;
                        text-align: center;
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
            }

            .riseColor{

            }
            .flex-wrap {
                display: flex;
                justify-content: space-between;
                margin-bottom: rem(30px);
                .flex-item {
                    display: inline-block;
                    .title {
                        padding: 0;
                        color: var(--minorColor);
                    }
                    .val {
                        color: var(--color);
                        font-size: rem(28px);
                    }
                    .cur-price{
                        font-size: rem(28px);
                    }
                    &:nth-child(2n) {
                        .val {
                            text-align: right;
                        }
                    }
                }
            }
            .ft {
                display: flex;
                vertical-align: middle;
                .van-button {
                    color: var(--primary);
                    vertical-align: middle;
                    background: v-bind(btnBg);
                    border-color: var(--primaryAssistColor);
                }
            }
            .amount {
                // font-weight: 600;
                font-size: rem(28px);
            }
            .arrow {
                color: var(--color);
                vertical-align: middle;
            }
            .warn {
                color: var(--color);
                background-color: var(--focusColor);
            }
            .name {
                display: inline-block;
                max-width: rem(360px);
                color: var(--color);
                font-size: rem(32px);
                vertical-align: middle;
            }
            .stock-tag{
                margin-left: rem(20px);
                border-radius: rem(4px);
                color: #FFF0D3;
                background: #ed8700;
                font-size: rem(20px);
                height: rem(28px);
                line-height: rem(31px);
                padding: 0 rem(6px);
                &.hk {
                    color: #ed8700;
                    background: #FFF0D3;
                }
                &.us {
                    border-radius: 2px;
                    color: #0062FF;
                    background: #E4E4E4;
                }
            }
            .lot {
                color: var(--minorColor);
                display: inline-block;
                margin-left: 0.5em;
                vertical-align: middle;
                font-size: rem(28px);
            }
            .time {
                color: var(--minorColor);
                font-size: rem(20px);
            }
            .tl{
                margin-top: rem(10px);
                display: flex;
                line-height: 1;
                align-items: flex-end;
            }
        }
        .icon_tubiao,.icon_-gupiao {
            display: inline-block;
            margin-left: rem(10px);
            margin-bottom: rem(2px);
            width: rem(52px);
            // height: rem(52px);
            font-size: rem(26px);
            font-style: normal;
            // line-height: rem(52px);
            text-align: center;
            border-radius: rem(6px);
            color: var(--minorColor);
            &.hidden {
                margin-right: rem(10px);
            }
        }
        .van-button {
            //width: rem(165px);
            flex: 1;
            height: rem(52px);
            margin-right: rem(20px);
            color: var(--primary) !important;
            font-size: rem(24px);
            line-height: rem(48px);
            background: b-bind(--btnBg) !important;
            border: none;
            border-color: var(--btnBg) !important;
            border-radius: rem(6px);
            &:last-child{
                margin-right: 0;
            }
        }
        .multipleVal{
            vertical-align: middle;
            position: relative;
            height: rem(32px);
            line-height: rem(32px);
            padding-left: rem(8px);
            padding-right: rem(10px);
            font-size: rem(24px);
            color: var(--color);
            border-radius: 3px;
            border: 1px solid var(--color);
            &.arrow{
                padding-right: rem(50px);
                color: var(--color);
            }

            .icon_icon_arrow{
                font-size: rem(22px);
                position: absolute;
                right: 4px;
                top: -0.5px;
            }
        }
    }
}
</style>
