<template>
    <div class='orderVolume'>
        <van-stepper
            v-if='product?.tradeType == 6'
            v-model='modelValue'
            allow-empty
            :min='0'
            :placeholder='$t("trade.priceLabel")'
            :step='step'
            @change='onChange'
        />
        <input
            v-else
            ref='inputEl'
            class='input'
            :placeholder='$t("trade.priceLabel")'
            type='text'
            :value='modelValue'
            @blur='onBlur'
            @input='onInput'
        />
    </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
import { getDecimalNum, toFixed } from '@/utils/calculation'

// 港股报价步长数组
const StepArr = [
    { l: 0.01, h: 0.25, v: 0.001 },
    { l: 0.25, h: 0.5, v: 0.005 },
    { l: 0.5, h: 10, v: 0.01 },
    { l: 10, h: 20, v: 0.02 },
    { l: 20, h: 100, v: 0.05 },
    { l: 100, h: 200, v: 0.1 },
    { l: 200, h: 500, v: 0.2 },
    { l: 500, h: 1000, v: 0.5 },
    { l: 1000, h: 2000, v: 1 },
    { l: 2000, h: 5000, v: 2 },
    { l: 5000, h: 99995, v: 5 }
]

export default {
    props: {
        product: {
            type: Object
        },
        modelValue: {
            type: [Number, String],
            default: ''
        },
        defaultPrice: {
            type: [Number, String],
            default: '' // 默认初始价格
        }
    },
    emits: ['update:modelValue', 'change'],
    setup (props, { emit }) {
        const inputEl = ref(null)
        const onInput = (e) => {
            let newval = e.target.value
            if (/[^0-9\.]/.test(newval)) { // 只能输入数字
                newval = newval.replace(/[^0-9\.]/g, '')
                e.target.value = newval
            }
            const digits = props.product.price_digits
            const reg = new RegExp('^\\d*(\\.?\\d{0,' + digits + '})', 'g')
            if (getDecimalNum(newval) > digits) {
                newval = (newval.match(reg)[0]) || ''
                if (digits === 0 && newval.endsWith('.')) newval = newval.replace(/\./g, '') // 浏览器不允许给number输入框输入'1.'字符串
                e.target.value = newval
            }

            emit('update:modelValue', newval)
            emit('change', newval)
        }
        const step = computed(() => {
            // 获取步长
            const val = props.modelValue
            const labels = props.product?.baseCurrency
            if (!val) {
                return props.defaultPrice
            }
            if (labels === 'USD') {
                return val >= 1 ? 0.01 : 0.0001
            }
            let right = StepArr.length - 1
            let left = 0
            while (left <= right) {
                // 中点
                const center = Math.floor((left + right) / 2)
                if (val < StepArr[center].l) {
                    right = center - 1
                } else {
                    left = center + 1
                }
            }
            return (right === -1) ? 0 : StepArr[right].v
        })

        const onBlur = (e) => {
            let value = e.target.value
            if (value === props.modelValue) return false
            value = value ? toFixed(value, this.digits) : value
            emit('change', value)
        }

        const onChange = (newval) => {
            emit('update:modelValue', newval)
            emit('change', newval)
        }

        const decimal = props.product.price_digits || props.product.symbolDigits

        return {
            inputEl,
            step,
            onInput,
            onBlur,
            onChange,
            decimal
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.orderVolume {
    margin-top: rem(20px);
    .input {
        width: 100%;
        height: rem(80px);
        font-size: rem(28px);
        line-height: 1;
        text-align: center;
        background: var(--assistColor);
    }
    .van-stepper{
        display: flex;
        margin-bottom: rem(30px);
        :deep(.van-stepper__minus), :deep(.van-stepper__plus){
            width: rem(80px);
            height: rem(80px);
            &:before{
                width: 12px;
            }
        }
        :deep(.van-stepper__plus){
            &:after{
                height: 12px;
            }
        }
        :deep(.van-stepper__input){
            flex: 1;
            margin: 0;
            height: rem(80px);
            font-size: rem(28px);
        }
    }
}
</style>
