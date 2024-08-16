<template>
    <div class='deal-item'>
        <div class='t-header'>
            <div class='fl'>
                <span class='direction' :class="Number(item.direction) === 1 ? 'riseColor' : 'fallColor'">
                    {{ Number(item.direction) === 1 ? $t('trade.buyShort') :$t('trade.sellShort') }}
                </span>
                <span class='name'>
                    {{ item?.symbolName || '--' }}
                </span>
                <span class='code'>
                    {{ item?.symbolCode || '--' }}
                </span>
            </div>
        </div>
        <div class='t-body'>
            <div class='t-block'>
                <p class='tl-item'>
                    <label for=''>
                        <span>
                            {{ $t('trade.dealVolume') }}
                        </span>
                    </label>
                    <span>
                        {{ item.executeNum || '--' }}
                    </span>
                </p>

                <p class='tl-item'>
                    <label for=''>
                        <span>
                            {{ $t('trade.dealPrice') }}
                        </span>
                    </label>
                    <span>
                        {{ item.executePrice || '--' }}
                    </span>
                </p>

                <p class='tl-item'>
                    <label for=''>
                        <span>
                            {{ $t('trade.dealAmount') }}
                        </span>
                    </label>
                    <span>
                        {{ mul(item.executePrice,item.executeNum) || '--' }}
                    </span>
                </p>

                <p class='tl-item'>
                    <label for=''>
                        <span>
                            {{ $t('trade.commission') }}
                        </span>
                    </label>
                    <span>
                        {{ item.commission || '--' }}
                    </span>
                </p>
            </div>
        </div>
        <div class='t-body'>
            <div class='t-block'>
                <p class='tl-item'>
                    <span>
                        {{ formatTime(item.executeTime,'YYYY/MM/DD HH:mm:ss' ) }}
                    </span>
                </p>
                <p class='tl-item'>
                    <span>
                        #{{ item?.dealId }}
                    </span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
// vue
import { computed } from 'vue'
import { mul } from '@/utils/calculation'
// vuex
import { useStore } from 'vuex'
export default {

    props: {
        // 数据
        item: {
            type: Object,
            defaulut: () => {}
        },
        // 玩法类型
        tradeType: {
            type: [Number, String],
            default: ''
        }
    },
    setup (props) {
        const store = useStore()
        // 获取当前产品
        const symbolKey = `${props.item.symbolId}_${props.tradeType}`
        const curProduct = computed(() => store.state._quote.productMap[symbolKey] || {})

        return {
            curProduct,
            mul
        }
    }
}
</script>

<style lang='scss' scoped>
@import '@/sass/mixin.scss';
.deal-item {
    margin: 0 rem(20px) rem(20px) rem(20px);
    padding: rem(20px);
    background-color: var(--contentColor);
    border-radius: rem(8px);
    .t-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: rem(30px);
        line-height: rem(60px);
        .fl {
            display: flex;
            line-height: 1;
            padding: rem(15px) 0 0;
            margin-right: rem(32px);
            color: var(--color);
            font-size: rem(32px);
            vertical-align: text-top;
            .name {
                margin-left: rem(20px);
            }
            .code{
                margin-left: rem(20px);
                color: var(--minorColor);
                font-size: rem(28px);
                align-self: end;
            }
            .direction{
                display: inline-block;
                padding: 0 rem(4px);
                height: rem(30px);
                line-height: rem(32px);
                border-radius: rem(6px);
                color: #fff;
                text-align: center;
                font-size: rem(24px);
                &.riseColor{
                    background: var(--riseColor);
                }
                &.fallColor{
                    background: var(--fallColor);
                }
            }
        }
    }
    .t-body {
        .t-block {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            .tl-item {
                display: inline-flex;
                justify-content: space-between;
                width: 47%;
                margin-bottom: rem(10px);
                color: var(--normalColor);
                line-height: rem(35px);
                label {
                    display: inline-block;
                    font-size: rem(24px);
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    vertical-align: middle;
                }
                span {
                    font-size: rem(24px);
                    text-align: left;
                    vertical-align: middle;
                }
            }
        }
    }
}
</style>
