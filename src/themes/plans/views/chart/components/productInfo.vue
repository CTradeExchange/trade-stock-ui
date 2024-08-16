<template>
    <div class='productInfo'>
        <div v-if='product?.symbolName' class='hd'>
            <div class='hd-left'>
                <p v-if='dealLastPrice' class='cur_price' :class='dealLastPrice?.price_color'>
                    {{ dealLastPrice.price ? parseFloat(dealLastPrice.price).toFixed(product?.symbolDigits) :'' }}
                </p>
            </div>
            <div class='others'>
                <span v-if='[1,2].includes(product?.tradeType)' :class='product?.rolling_upDownColor'>
                    {{ product.rolling_upDownAmount }}
                    <span>
                        ({{ product?.rolling_upDownAmount_pip }} {{ $t('trade.dot') }})
                    </span>
                </span>
                <div class='others-bottom'>
                    <span v-if='[6].includes(product?.tradeType)' class='upDownAmount' :class='product.upDownColor'>
                        {{ product.upDownWidth }}
                    </span>
                    <span v-if='[6].includes(product?.tradeType)' class='upDownAmount' :class='product.upDownColor'>
                        {{ product.upDownAmount }}
                    </span>
                    <span v-else class='upDownAmount' :class='product.rolling_upDownColor'>
                        {{ product.rolling_upDownWidth }}
                    </span>
                </div>
            </div>
            <div class='loan'>
                <div class='loan-warp' @click='loan.showLoan = true'>
                    <img v-if='product.enableLongLoan==1' class='icon-loan rong' :src="'/images/rong.png?v=1'" />
                    <img v-if='product.enableShortLoan==1' class='icon-loan kong' :src="'/images/kong.png?v=1'" />
                </div>
                <div v-show='loan.showLoan' class='loan-popup'>
                    <van-popup v-model:show='loan.showLoan' duration='0.2' position='top'>
                        <div v-if='product.enableLongLoan==1' class='li' @click='handleLoanDialog(1)'>
                            <img class='title icon-loan rong' :src="'/images/rong.png?v=1'" />
                            <div class='desc'>
                                {{ $t('trade.rongDesc') }}
                            </div>
                        </div>
                        <div v-if='product.enableShortLoan==1' class='li' @click='handleLoanDialog(2)'>
                            <img class='title icon-loan kong' :src="'/images/kong.png?v=1'" />
                            <div class='desc'>
                                {{ $t('trade.kongDesc') }}
                            </div>
                        </div>
                    </van-popup>
                </div>
                <van-popup v-model:show='loan.showDialog' closeable :style="{ width: '80%' }">
                    <div class='loan-dialog'>
                        <div class='title'>
                            {{ marginList.title }}
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>{{ $t('trade.marginType') }}</th>
                                    <th>{{ $t('trade.daytime') }}</th>
                                    <th>{{ $t('trade.overnight') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {{ marginList.name + $t('trade.initMargin') }}
                                    </td>
                                    <td>
                                        {{ marginList.daytimeInitMarginRatio }}
                                    </td>
                                    <td>
                                        {{ marginList.overnightInitMarginRatio }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {{ marginList.name + $t('trade.alarmMargin') }}
                                    </td>
                                    <td>
                                        {{ marginList.daytimeAlarmMarginRatio }}
                                    </td>
                                    <td>
                                        {{ marginList.overnightAlarmMarginRatio }}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        {{ marginList.name + $t('trade.remainingMargin') }}
                                    </td>
                                    <td>
                                        {{ marginList.daytimeRemainingMarginRatio }}
                                    </td>
                                    <td>
                                        {{ marginList.overnightRemainingMarginRatio }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table>
                            <thead>
                                <tr>
                                    <th>{{ $t('trade.loanYearRatio') }}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        {{ marginList.name + $t('trade.loanYearRatio') + "("+ $t('information.year') +")" }}
                                    </td>
                                    <td>
                                        {{ marginList.loanYearRatio }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </van-popup>
            </div>
            <div v-if='product.etf' class='ft'>
                <ETF @click='etfTip' />
            </div>
        </div>
        <div v-if='product' class='bd'>
            <div class='item'>
                <template v-if='product.isCryptocurrency'>
                    <p class='priceBottom'>
                        <span>
                            {{ $t('common.24hHigh') }}
                        </span>
                        <span>
                            {{ product.rolling_high_price }}
                        </span>
                    </p>
                    <p>
                        <span>
                            {{ $t('common.24hLow') }}
                        </span>
                        <span>
                            {{ product.rolling_low_price }}
                        </span>
                    </p>
                </template>
                <template v-else>
                    <p class='priceBottom'>
                        <span>
                            {{ $t('trade.todayOpen') }}
                        </span>
                        <span>
                            {{ product.open_price }}
                        </span>
                    </p>
                    <p>
                        <span>
                            {{ $t('trade.yesterdayClosed') }}
                        </span>
                        <span>
                            {{ product.yesterday_close_price }}
                        </span>
                    </p>
                </template>
                <p v-if='product.etf' class='priceTop'>
                    <span>
                        {{ $t('fundInfo.realtimeJZ') }}({{ product.fundCurrency }})
                    </span>
                    <span>
                        {{ product.currentNav || '--' }}
                    </span>
                </p>
            </div>
            <div class='item'>
                <template v-if='product.isCryptocurrency'>
                    <p class='priceBottom'>
                        {{ $t('common.24hNumber') }}({{ product.baseCurrency }})
                        <span>
                            {{ formatAmount(product.rolling_transactions_number) }}
                        </span>
                    </p>
                    <p>
                        {{ $t('common.24hAmount') }}({{ product.profitCurrency }})
                        <span>
                            {{ formatAmount(product.rolling_amount) }}
                        </span>
                    </p>
                </template>
                <template v-else>
                    <p class='priceBottom'>
                        {{ $t('trade.high') }}
                        <span>
                            {{ product.high_price }}
                        </span>
                    </p>
                    <p>
                        {{ $t('trade.low') }}
                        <span>
                            {{ product.low_price }}
                        </span>
                    </p>
                </template>

                <p v-if='product.etf' class='priceTop'>
                    {{ $t('fundInfo.premiumRate') }}({{ product.fundCurrency }})
                    <span>
                        {{ product.premiumRate || '--' }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import ETF from '@plans/components/etfIcon.vue'
import { Dialog } from 'vant'
import { computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { toFixed, mul, formatAmount } from '@/utils/calculation'
import { useI18n } from 'vue-i18n'

const { t } = useI18n({ useScope: 'global' })
const store = useStore()
const dealLastPrice = computed(() => store.state._quote.dealLastPrice)
const product = computed(() => store.getters.productActived)
const loan = reactive({
    showLoan: false, // 是否展示融资融券详情
    showDialog: false,
    dialogType: 0,
})
const handleLoanDialog = (type) => {
    loan.showDialog = true
    loan.dialogType = type
}

const marginList = computed(() => {
    const margin = {
        title: '',
        daytimeInitMarginRatio: '--', // 日内初始保证金比例
        daytimeRemainingMarginRatio: '--', // 日内维持保证金比例
        daytimeAlarmMarginRatio: '--', // 日内预警保证金比例
        overnightInitMarginRatio: '--', // 隔夜初始保证金比例
        overnightRemainingMarginRatio: '--', // 隔夜维持保证金比例
        overnightAlarmMarginRatio: '--', // 隔夜预警保证金比例
        loanYearRatio: '--' // 参考利息率
    }
    const product = store.getters.productActived
    if (product && loan.dialogType) {
        margin.name = `${(loan.dialogType === 1 ? t('trade.longLoan') : t('trade.shortLoan'))}`
        margin.title = `${t('trade.support')}${margin.name}`

        const daytimeInitMarginRatio = (loan.dialogType === 1) ? product.daytimeBuyInitMarginRatio?.percent : product.daytimeSellInitMarginRatio?.percent
        margin.daytimeInitMarginRatio = toFixed(mul(daytimeInitMarginRatio, 100)) + '%'

        const daytimeRemainingMarginRatio = (loan.dialogType === 1) ? product.daytimeBuyRemainingMarginRatio?.percent : product.daytimeSellRemainingMarginRatio?.percent
        margin.daytimeRemainingMarginRatio = toFixed(mul(daytimeRemainingMarginRatio, 100)) + '%'

        const daytimeAlarmMarginRatio = (loan.dialogType === 1) ? product.daytimeBuyAlarmMarginRatio?.percent : product.daytimeSellAlarmMarginRatio?.percent
        margin.daytimeAlarmMarginRatio = toFixed(mul(daytimeAlarmMarginRatio, 100)) + '%'

        const overnightInitMarginRatio = (loan.dialogType === 1) ? product.overnightBuyInitMarginRatio?.percent : product.overnightSellInitMarginRatio?.percent
        margin.overnightInitMarginRatio = toFixed(mul(overnightInitMarginRatio, 100)) + '%'

        const overnightRemainingMarginRatio = (loan.dialogType === 1) ? product.overnightBuyRemainingMarginRatio?.percent : product.overnightSellRemainingMarginRatio?.percent
        margin.overnightRemainingMarginRatio = toFixed(mul(overnightRemainingMarginRatio, 100)) + '%'

        const overnightAlarmMarginRatio = (loan.dialogType === 1) ? product.overnightBuyAlarmMarginRatio?.percent : product.overnightSellAlarmMarginRatio?.percent
        margin.overnightAlarmMarginRatio = toFixed(mul(overnightAlarmMarginRatio, 100)) + '%'

        if (loan.dialogType === 1) {
            const loanYearRatio = product.longLoanYearRatio.find(item => item.assetCode === product.profitCurrency)
            const loanYearRatioValue = loanYearRatio?.value || 0
            margin.loanYearRatio = toFixed(mul(loanYearRatioValue, 100)) + '%'
        } else {
            margin.loanYearRatio = toFixed(mul(product.shortLoanYearRatio, 100)) + '%'
        }
    }

    return margin
})

// 点击etf图标的提示
const etfTip = () => {
    Dialog.alert({
        message: t('trade.productEtfTip'),
    })
}
</script>

<style lang="scss" scoped>
.productInfo {
    padding: rem(10px) rem(20px) rem(10px) rem(20px);
    background: var(--contentColor);
    position: relative;
    .hd {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        height: rem(60px);
        min-width: rem(265px);
        font-size: rem(24px);
        line-height: 1;
        .others {
            flex: 1;
            margin-left: rem(10px);
            align-self: flex-end;
            > span {
                display: block;
                margin: rem(5px) 0;
            }
            .others-bottom {
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                margin-bottom: rem(6px);
            }
        }
        .expire-date {
            display: flex;
            flex: 1;
            flex-direction: row;
            flex-wrap: nowrap;
            align-self: flex-end;
            justify-content: flex-end;
            color: #646566;
            font-size: rem(24px);
            white-space: nowrap;
            .value {
                min-width: rem(153px);
                text-align: right;
            }
        }
        .account-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: rem(14px) rem(17px) rem(10px);
            color: #FF8400;
            font-weight: 500;
            font-size: rem(21px);
            border: 2px solid #FF8400;
            border-radius: rem(10px);
            .text {
                display: block;
                margin-bottom: rem(5px);
                font-size: rem(22px);
                line-height: rem(24px);
            }
            .balance {
                font-weight: 400;
                font-size: rem(30px);
                line-height: rem(32px);
            }
        }
        .hd-left {
            &.flex-auto {
                flex: 1;
            }
            .hd-left-others {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                .others-bottom {
                    margin-left: rem(20px);
                }
            }
        }
        .loan {
            .icon-loan {
                margin-left: 2px;
                width: rem(32px);
                height: rem(32px);
                border-radius: 2px;
                display: inline-flex;
                vertical-align: top;
            }
            .loan-popup {
                position: fixed;
                right: 0;
                left: 0;
                top: rem(200px);
                bottom: 0;
                z-index: 1001;
                display: flex;
                justify-content: space-between;
                :deep(.van-overlay) {
                    position: absolute;
                }
                :deep(.van-popup) {
                    position: absolute;
                    display: flex;
                    padding: 0 rem(30px);
                    .li {
                        display: flex;
                        align-items: center;
                        flex: 1;
                        height: rem(100px);
                        .title {
                            width: rem(52px);
                            height: rem(52px);
                            margin-right: rem(20px);
                        }
                    }
                }
            }
            .loan-dialog {
                padding: rem(44px) rem(30px) rem(20px) rem(30px);
                .title {
                    font-size: rem(35px);
                    text-align: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border-spacing: 0;
                    margin-top: rem(20px);
                    text-align: center;
                    thead {
                        color: var(--primay);
                        padding: rem(20px) 0;
                        tr {
                            border-bottom: 1px solid var(--bgColor);
                        }
                        th {
                            font-size: rem(25px);
                        }
                    }
                    th {
                        padding: rem(20px) 0;
                    }
                    th,
                    td {
                        padding: rem(20px) 0;
                        &:first-child {
                            text-align: left;
                        }
                    }
                }
            }
        }
        .ft {
            margin-left: rem(10px);
        }
    }
    .bd {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: flex-start;
        width: 100%;
        padding-top: rem(20px);
        color: var(--normalColor);
        font-size: rem(24px);
        .item {
            display: flex;
            flex: 1;
            flex-direction: column;
            margin-left: rem(40px);
            &:first-child {
                flex: none;
                width: 43%;
                margin-left: 0;
            }
            &:first-child {
                margin-right: rem(5px);
            }
            > p {
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                align-items: center;
                justify-content: space-between;
                white-space: nowrap;
                &.priceBottom {
                    margin-bottom: rem(10px);
                }
                &.priceTop {
                    margin-top: rem(10px);
                }
            }
        }
        .point-value {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            align-items: center;
            justify-content: flex-start;
            .van-icon {
                padding: 0 rem(5px);
            }
        }
    }
    .priceTime {
        position: absolute;
        top: rem(35px);
        right: rem(20px);
        color: #777;
    }
    .cur_price {
        font-size: rem(60px);
        // padding-bottom: rem(13px);
    }
    .upDownAmount {
        padding-right: rem(12px);
    }
    .icon_icon_prompt {
        @include active();
        font-size: rem(40px);
        vertical-align: middle;
    }
}
</style>>
