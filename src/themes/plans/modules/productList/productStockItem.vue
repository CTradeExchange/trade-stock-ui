<template>
    <div class='productItem of-1px-bottom' :class='[bgClass]' :data-symbolId='product.symbolId' @click="$emit('open')">
        <div v-if='product.symbolName' class='cell'>
            <div
                class='item name'
                :class='[
                    getLen(product.simplified) > 10 && "small",
                    getLen(product.simplified) > 15 && "mini"]'
            >
                <p>{{ product.symbolName }}</p>
                <p class='sub'>
                    <i v-if="labels.includes('us-stock')" class='subItem us'>
                        US
                    </i>
                    <i v-else-if="labels.includes('hk-stock')" class='subItem us'>
                        HK
                    </i>
                    <i class='subItem code'>
                        {{ product.symbolCode }}
                    </i>
                    <i v-if='product.enableLongLoan==1' class='icon-loan rong'></i>
                    <i v-if='product.enableShortLoan==1' class='icon-loan kong'></i>
                    <i v-if='product.dividend==1' class='icon-loan chu'></i>
                </p>
            </div>
            <div class='item'>
                <span
                    class='price'
                    :class='[product.cur_color, "digits" + product.symbolDigits]'
                >
                    {{ !product.cur_price && product.cur_price != 0 ? '- -' : product.cur_price }}
                </span>
            </div>
            <div class='item'>
                <span
                    class='price'
                    :class='[product.upDownColor, "digits" + product.symbolDigits]'
                >
                    {{ !product.upDownAmount && product.upDownAmount != 0 ? '- -' : product.upDownAmount }}
                </span>
            </div>
            <div class='item'>
                <span
                    class='price bold'
                    :class='[product.upDownColor,"digits" + product.symbolDigits]'
                >
                    {{ !product.upDownWidth && product.upDownWidth != 0 ? '- -' : product.upDownWidth }}
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { computed, reactive, toRefs, watch } from 'vue'
import { useStore } from 'vuex'
import { getLen, localGet } from '@/utils/util'
export default {
    props: {
        product: {
            type: Object,
            default: () => ({})
        },
    },
    setup (props, context) {
        const store = useStore()

        const labels = computed(() => props.product.labels?.toLowerCase().split(',') || [])
        const quoteMode = computed(() => store.state.quoteMode)
        const longName = computed(() => getLen(props.product?.symbolName) > 10)
        const tickTime = computed(() => {
            const tick_time = props.product.tick_time ?? ''
            return tick_time ? window.dayjs(Number(tick_time)).format('HH:mm:ss') : ''
        })

        const chartColorType = computed(() => Number(JSON.parse(localGet('chartConfig'))?.chartColorType) || 1)

        const state = reactive({
            bgClass: ''
        })
        let price = 0
        watch(
            () => props.product.sell_price,
            (val) => {
                if (price === 0) {
                    if ((props.product.sell_color === 'riseColor' && chartColorType.value === 1) || (props.product.sell_color === 'fallColor' && chartColorType.value === 2)) {
                        state.bgClass = 'riseColorBgAni'
                    } else if ((props.product.sell_color === 'fallColor' && chartColorType.value === 1) || (props.product.sell_color === 'riseColor' && chartColorType.value === 2)) {
                        state.bgClass = 'fallColorBgAni'
                    }
                    price = val
                } else {
                    if (val - price > 0) {
                        state.bgClass = 'riseColorBgAni'
                    } else if (val - price < 0) {
                        state.bgClass = 'fallColorBgAni'
                    }
                    price = val
                }
            })
        return {
            ...toRefs(state),
            tickTime,
            labels,
            quoteMode,
            getLen,
            longName,
        }
    }
}
</script>

<style lang="scss" scoped>
@import '~@/sass/mixin.scss';
.productItem {
    @include active();
    position: relative;
    height: rem(118px);
    padding: rem(20px) 0;
    overflow: hidden;
    line-height: rem(76px);
    background-color: var(--contentColor);
    .cell {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0 rem(30px);
        color: var(--minorColor);
        font-size: rem(24px);
    }
    .item {
        flex: 1;
        text-align: right;
        &:first-child {
            flex: none;
            width: rem(200px);
            text-align: left;
        }
    }
    .name {
        color: var(--color);
        font-weight: 400;
        font-size: rem(30px);
        line-height: 1.15;
        padding-bottom: 1px;
        p {
            @include ellipsis();
        }
        &.small {
            font-size: rem(26px);
        }
        &.mini {
            font-size: rem(22px);
        }
        .sub {
            font-size: 0;
            margin-top: 6px;
            line-height: 1;
        }
        .subItem {
            font-size: 12px;
            display: inline-block;
            margin-right: 3px;
            vertical-align: middle;
        }
        .icon-loan{
            display: inline-block;
            margin-right: 3px;
            vertical-align: middle;
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background-size: cover;
            background-repeat: no-repeat;
        }
        .us {
            color: #2B70BE;
        }
        .code{
            color: #999;
        }
        .chu{
            background-image: url(/images/chu.png?v=1);
        }
        .rong {
            background-image: url(/images/rong.png?v=1);
        }
        .kong {
            background-image: url(/images/kong.png?v=1);
        }
    }
    .price {
        font-size: rem(30px);
        &.digits11,
        &.digits12,
        &.digits13 {
            font-size: rem(26px);
        }
        &.digits14,
        &.digits15,
        &.digits16 {
            font-size: rem(22px);
        }
    }
    .bold {
        font-weight: bold;
    }
}
</style>
