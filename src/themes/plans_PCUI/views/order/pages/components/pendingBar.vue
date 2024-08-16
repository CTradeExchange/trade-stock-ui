<template>
    <div class='orderVolume' :class='{ orderVolumeStock: product?.tradeType == 6 }'>
        <van-stepper
            v-if='product?.tradeType == 6'
            v-model='modelValue'
            allow-empty
            button-size='26px'
            input-width='180px'
            :min='0'
            :placeholder='placeholderStock'
            :step='step'
            @change='onStepperChange'
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
import { reactive, ref, computed } from 'vue'
import { useStore } from 'vuex'
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
    name: 'PendingBar',
    props: {
        product: {
            type: Object
        },
        modelValue: {
            type: [Number, String],
            default: ''
        },
        direction: {
            type: String
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
        // 步长组件输入变化
        const onStepperChange = (newval) => {
            emit('update:modelValue', newval)
            emit('change', newval)
        }
        return {
            step,
            inputEl,
            onStepperChange,
            onInput,
            onBlur,
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.orderVolume {
    flex: 1;
    .input {
        width: 100%;
        line-height: 1;
        text-align: center;
    }
}
.orderVolumeStock {
    text-align: right;
    margin-top: -4px;
    margin-right: -10px;
    :deep() {
        .van-stepper__input {
            background: var(--contentColor);
            margin: 0 4px;
        }
        button:not(.van-stepper__minus--disabled,.van-stepper__plus--disabled) {
            background: #E2E2E2;
        }
        .van-stepper__minus--disabled {
            color: var(--van-stepper-button-icon-color);
            background: #E2E2E2;
        }
        button:not(.van-stepper__minus--disabled):hover {
            opacity: 0.6;
        }
    }
}
</style>
