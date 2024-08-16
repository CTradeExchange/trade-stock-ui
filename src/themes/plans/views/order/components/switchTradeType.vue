<template>
    <div class='switchTradeType'>
        <div v-if='product' class='productInfo'>
            <i v-if='product.symbolName' class='icon_quanrejiaohuan- sortIcon' :class='{ en: getLen(product.symbolName.charAt(0))===1 }' name='icon_zhankai2' @click="$emit('switchProduct')"></i>
            <!-- <svg class='sortSvg' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>
                <g fill='none' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'>
                    <path d='M3 17h5l1.67-2.386m3.66-5.227L15 7h6' /><path d='M18 4l3 3l-3 3' /><path d='M3 7h5l7 10h6' /><path d='M18 20l3-3l-3-3' />
                </g>
            </svg> -->
            <div class='containerCenter'>
                <div v-if='product.tradeType === 6' class='stockProductName' :class='{ vertical:getLen(product.symbolName)>16 }'>
                    <p class='productName'>
                        {{ product.symbolName }}
                    </p>
                    <p class='symbolCode'>
                        {{ product.symbolCode }}
                    </p>
                </div>
                <span v-else class='productName'>
                    {{ product.symbolName }}
                </span>
                <ETF v-if='product.etf' class='etf' />
                <span class='upDownWidth' :class='[product.tradeType === 6 ? product.upDownColor : product.rolling_upDownColor]'>
                    {{ product.tradeType === 6 ? product.upDownWidth : product.rolling_upDownWidth }}
                </span>
                <span class='upDownWidth' :class='[product.tradeType === 6 ? product.upDownColor : product.rolling_upDownColor]'>
                    {{ product.upDownAmount }}
                </span>
            </div>

            <span class='chartIcon icon_-gupiao' @click="$router.push({ name:'Product', query: { symbolId:product.symbolId, tradeType:product.tradeType } })"></span>
        </div>
    </div>
</template>

<script>
import ETF from '@plans/components/etfIcon.vue'
import { getLen } from '@/utils/util'
export default {
    components: {
        ETF,
    },
    props: ['product'],
    emits: ['switchProduct'],
    setup (props, { emit }) {
        return {
            getLen
        }
    }
}
</script>

<style lang="scss" scoped>
@import '~@/sass/mixin.scss';
.switchTradeType {
    position: relative;
    background: var(--contentColor);
}
.switchWrapper {
    display: flex;
    height: rem(90px);
    padding: 0 rem(30px);
    color: var(--minorColor);
    font-size: rem(28px);
    line-height: rem(90px);
    border-bottom: 1px solid var(--assistColor);
    .item {
        margin-right: rem(35px);
        vertical-align: baseline;
    }
    .active {
        color: var(--color);
        font-weight: bold;
        font-size: rem(38px);
    }
}
.productInfo {
    display: flex;
    align-items: center;
    height: rem(104px);
    padding: 0 rem(30px);
    font-size: rem(34px);
    // line-height: rem(104px);
    .icon_chouti1 {
        padding-right: rem(20px);
        font-size: rem(26px);
    }
    .productName {
        @include ellipsis();
        margin-left: rem(20px);
        font-weight: bold;
    }
    .symbolCode,
    .etf {
        margin-left: rem(20px);
    }
    .upDownWidth {
        margin-left: rem(20px);
        font-size: rem(28px);
    }
    .chartIcon {
        width: rem(62px);
        height: rem(58px);
        color: var(--normalColor);
        font-weight: 500;
        font-size: rem(30px);
        line-height: rem(58px);
        text-align: center;
        border-radius: 3px;
    }
    .sortIconSpan {
        margin-right: 3px;
        padding-top: 8px;
    }
    .sortSvg {
        width: rem(44px);
        margin-right: 0.2em;
    }
    .sortIcon {
        display: inline-block;
        font-weight: bold;
        // transform: rotate(90deg);
        font-size: rem(34px);
        // &.en{
        //     margin-top: rem(-6px);
        // }
    }
    .containerCenter {
        display: flex;
        flex: 1;
        align-items: flex-end;
    }
    .stockProductName {
        display: flex;
        align-items: flex-end;
        &.vertical {
            flex-direction: column;
            line-height: 1;
            .symbolCode {
                margin-top: 5px;
            }
        }
    }
    .productName {
        font-size: rem(40px);
    }
    .symbolCode {
        font-size: rem(28px);
        color: var(--minorColor);
    }
}
</style>
