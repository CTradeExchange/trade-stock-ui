<template>
    <centerViewDialog>
        <div class='pageWrap'>
            <Loading :show='loading' />
            <!-- 头部导航 -->
            <LayoutTop>
                <template #right>
                    <span @click='rightClick'>
                        {{ rightAction.title }}
                    </span>
                </template>
            </LayoutTop>
            <div class='wrap'>
                <p class='header-text'>
                    {{ $t('withdrawMoney.moneyName') }}
                </p>
                <div class='field-wrap'>
                    <input v-model='amount' :placeholder='amountPlaceholder' type='number' @change='changeAmount' @input='changeAmount' />
                    <button class='get-btn' plain round size='small' @click='getAll'>
                        {{ $t('withdrawMoney.allBtn') }}
                    </button>
                </div>
                <div class='notice'>
                    <span class='can-name'>
                        {{ $t('withdrawMoney.canName') }} {{ withdrawAmount }} {{ accountCurrency?.currency }}
                    </span>
                    <span>{{ $t('withdrawMoney.serviceName') }} {{ fee }} {{ accountCurrency?.currency }}</span>
                </div>
                <div class='bank-wrap'>
                    <p class='bw-t'>
                        {{ $t('withdrawMoney.bankName') }}
                    </p>
                    <div v-if='!isEmpty(checkedBank)' class='bank bank-flex' @click='openSheet'>
                        <i class='bank-icons-sm' :class="'bk-'+ checkedBank?.bankCode"></i>
                        <span class='bank-no'>
                            {{ checkedBank?.bankName }} {{ hideMiddle(checkedBank?.bankCardNumber) }}
                        </span>
                        <van-icon name='arrow-down' />
                    </div>
                    <div v-else class='bank no-data' @click='openSheet'>
                        <span>{{ $t('withdrawMoney.bankNone') }}</span>
                        <van-icon name='arrow-down' />
                        <!-- <van-button plain round size='mini' type='success' @click='toAddBank'>
                            {{ $t('withdrawMoney.addBtn') }}
                        </van-button> -->
                    </div>
                    <p class='bw-t2'>
                        {{ $t('withdrawMoney.predictName') }} {{ computePre }} {{ currency }}
                    </p>
                </div>

                <div class='fund'>
                    <p class='bw-t'>
                        {{ $t('common.fundPwd') }}
                    </p>
                    <div class='fund-input'>
                        <InputComp
                            v-model='pwd'
                            class='input-comp'
                            clear
                            :label="$t('common.inputFundPwd')"
                            :max-length='6'
                            pwd
                        />
                        <router-link v-if='Number(customInfo.assertPassStatus) === 1' class='href' to='/assets/setFundPwd'>
                            {{ $t('login.goSet') }}
                        </router-link>
                        <span v-else class='href' @click='goFundForgot'>
                            {{ $t('login.forgotFundPwd') }}
                        </span>
                    </div>
                </div>
                <div v-if='googleCodeVis' class='field-google'>
                    <p class='bw-t'>
                        {{ $t('common.googleCode') }}
                    </p>
                    <googleVerifyCode @getGooleVerifyCode='getGooleVerifyCode' />
                </div>
            </div>
        </div>

        <van-button block class='confirm-btn' type='primary' @click='confirm'>
            <span>{{ $t('withdraw.confirm') }}</span>
        </van-button>
    </centerViewDialog>

    <!-- 选择银行卡弹窗 -->
    <van-dialog v-model:show='show' :round='false' :title="$t('withdrawMoney.bankPopupTitle')">
        <div class='bank-list'>
            <div
                v-for='(item, index) in bankList'
                :key='index'
                class='bank'
                :class='{ disabled: item.bankCurrency !== currency }'
                @click='chooseBank(item)'
            >
                <div class='bank-item'>
                    <i class='bank-icons-sm' :class="'bk-'+ item.bankCode"></i>
                    <div class='bank-no'>
                        <p>{{ item.bankName }} {{ hideMiddle(item.bankCardNumber) }}</p>
                        <p v-if='item.bankCurrency !== currency' class='tips'>
                            {{ $t('withdrawMoney.bankTips') }}
                        </p>
                    </div>
                    <van-icon v-if='item.checked' class='icon-success' color='#53C51A' name='success' />
                </div>
            </div>
            <div class='add-bank' @click='toAddBank'>
                <van-icon class='icon-plus' name='plus' size='13' />
                <span>{{ $t('withdrawMoney.bankPopupBtn') }}</span>
                <van-icon class='icon-arrow' name='arrow' size='13' />
            </div>
        </div>
    </van-dialog>

    <!-- 提交成功弹窗 -->
    <van-dialog v-model:show='withdrawSuccess' :confirm-button-text="$t('common.sure')" :show-cancel-button='false' @confirm='$router.push("/assets")'>
        <div class='add-success'>
            <i class='icon_success'></i>
            <p class='title'>
                {{ $t('withdraw.successText') }}
            </p>
            <p class='content'>
                {{ $t('withdraw.moneySuccessMsg') }}
            </p>
        </div>
    </van-dialog>

    <!-- 取款时间弹窗 -->
    <van-dialog v-model:show='timeShow' :title="$t('withdraw.hint')">
        <div class='time-wrap'>
            <h4>{{ $t('withdraw.timeHint') }} </h4>
            <p v-if='timeList.length > 0'>
                {{ $t('withdraw.timeName') }}:
            </p>
            <div v-if='timeList.length > 0' class='flex'>
                <div class='time-text'>
                    <p v-for='(item,index) in timeList' :key='index' class='time-text-flex'>
                        <span class='time-label'>
                            {{ item.weekDay }}:
                        </span>
                        <span class='time-val'>
                            {{ item.openTimeLocal.toString() }}
                        </span>
                    </p><br />
                </div>
            </div>
        </div>
    </van-dialog>

    <!-- 补充资料弹窗 -->
    <van-popup v-model:show='appendVis' class='append-popup' position='right' :style="{ height: '100%', width: '500px' }">
        <div class='append-wrap'>
            <p class='title'>
                {{ $t('deposit.appendFiled') }}
            </p>
            <van-cell-group inset>
                <van-field
                    v-for='(item, key) in extend'
                    :key='key'
                    v-model='item.value'
                    :data='item'
                    :label='item[lang]'
                    label-width='80'
                    :placeholder="$t('common.input') + item[lang]"
                    :required='true'
                />
            </van-cell-group>
            <van-button class='btn' size='large' type='primary' @click='handleAppendField'>
                {{ $t('common.sure') }}
            </van-button>
        </div>
    </van-popup>
</template>

<script>
import centerViewDialog from '@planspc/layout/centerViewDialog'
import googleVerifyCode from '@/themeCommon/components/googleVerifyCode.vue'
import {
    reactive,
    computed,
    toRefs,
    onBeforeMount
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Toast, Dialog } from 'vant'
import { isEmpty, debounce, getCookie } from '@/utils/util'
import { retainDecimal, getDecimalNum } from '@/utils/calculation'
import { useStore } from 'vuex'
import {
    handleWithdraw,
    queryWithdrawConfig,
    queryWithdrawRate,
    queryBankList,
    computeWithdrawFee,
    checkKycApply,
    getWithdrawMethodList
} from '@/api/user'
import { useI18n } from 'vue-i18n'
import InputComp from '@/components/form/input'
import md5 from 'js-md5'

export default {
    components: {
        centerViewDialog,
        InputComp,
        googleVerifyCode
    },
    setup (props) {
        const { t } = useI18n({ useScope: 'global' })
        const store = useStore()
        const router = useRouter()
        const route = useRoute()

        const { currency, accountId, tradeType, currentTab } = route.query

        const weekdayMap = {
            1: t('weekdayMap.1'),
            2: t('weekdayMap.2'),
            3: t('weekdayMap.3'),
            4: t('weekdayMap.4'),
            5: t('weekdayMap.5'),
            6: t('weekdayMap.6'),
            7: t('weekdayMap.7')
        }

        // 获取账户信息
        const customInfo = computed(() => store.state._user.customerInfo)
        const googleCodeVis = computed(() => customInfo.value.googleId > 0)
        const onlineServices = computed(() => store.state._base.wpCompanyInfo?.onlineService)
        // 账户币种
        const { value: accountCurrency } = computed(() => store.state._user.customerInfo.accountList.find(el => el.accountId === Number(accountId)))

        const timeList = computed(() => {
            const timeConfigList = state.withdrawTimeConfigMap
            const tempList = []

            if (!isEmpty(timeConfigList)) {
                for (const key in timeConfigList) {
                    if (Object.hasOwnProperty.call(timeConfigList, key)) {
                        const item = timeConfigList[key]

                        if (!isEmpty(item.openTimeLocal)) {
                            tempList.push({
                                weekDay: weekdayMap[item.weekDay],
                                openTimeLocal: item.openTimeLocal
                            })
                        }
                    }
                }
            }
            return tempList
        })

        const state = reactive({
            lang: getCookie('lang') || 'zh-CN', // 当前语言
            rightAction: { // 头部导航栏右侧
                title: t('withdraw.moneyRecordText'),
                path: '/assets/withdrawRecord?withdrawType=1'
            },
            withdrawAmount: '0.00', // 可提金额
            amountPlaceholder: currentTab !== 'otc365_cny' ? t('withdrawMoney.moneyPlaceholder') : t('withdrawMoney.moneyPlaceholder') + `(${t('withdrawMoney.digitsTip')})`, // 提现金额输入框提示
            amount: '', // 提现金额
            fee: '--', // 手续费
            computePre: '--', // 预计到账
            singleHighAmount: 0, // 最高可提金额
            singleLowAmount: 0, // 最低可提金额
            loading: false,
            show: false,
            checkedBank: {},
            withdrawRate: null,
            withdrawConfig: '',
            bankList: [],
            fun: null,
            withdrawSuccess: false,
            withdrawCurrency: '',
            timeShow: false,
            withdrawTimeConfigMap: {}, // 处理后的时区
            appendVis: false, // 是否显示补充资料弹窗
            extend: {}, // 需要补充资料的数据
            paramsExtens: {}, // 补充完整的资料数据
            pwd: '',
            googleCode: ''
        })

        // 初始化数据
        const init = () => {
            state.amount = ''
            state.fee = '--'
            state.computePre = '--'
        }

        // 导航栏右侧标题点击跳转
        const rightClick = () => {
            router.push(state.rightAction.path)
        }

        // 跳转到忘记资金密码页面
        const goFundForgot = () => {
            router.push({
                name: 'Forgot',
                query: {
                    type: 'fund'
                }
            })
        }

        // 获取取款手续费
        const getWithdrawFee = debounce(() => {
            const amount = parseFloat(state.amount)
            if (!state.withdrawRate) return
            if (state.amount === '') return
            if (!amount) {
                return Toast(t('withdrawMoney.hint_1'))
            }
            if (amount < state.singleLowAmount) {
                return Toast(`${t('withdrawMoney.hint_3')}${state.singleLowAmount}`)
            }
            if (amount > state.singleHighAmount) {
                return Toast(`${t('withdrawMoney.hint_4')}${state.singleHighAmount}`)
            }

            const params = {
                accountId,
                accountCurrency: accountCurrency.currency,
                amount: state.amount.toString(),
                tradeType,
                // companyId: customInfo.value.companyId,
                // customerNo: customInfo.value.customerNo,
                // customerGroupId: customInfo.value.customerGroupId,
                // country: customInfo.value.country,
                withdrawCurrency: currency,
                withdrawType: 1,
                withdrawMethod: currentTab,
                withdrawRateSerialNo: state.withdrawRate.withdrawRateSerialNo
            }
            computeWithdrawFee(params).then(res => {
                if (res.check()) {
                    const { data } = res
                    state.fee = data.withdrawFee
                    state.computePre = data.finalAmount
                }
            })
        }, 1000)

        const transferUtc = () => {
            const todayStr = window.dayjs().format('YYYY-MM-DD')
            state.withdrawConfig.withdrawTimeConfigList.forEach(el => {
                el.openTimeLocal = []
                state.withdrawTimeConfigMap[el.weekDay] = {
                    weekDay: el.weekDay,
                    openTime: el.openTime,
                    openTimeLocal: []
                }
            })

            // 处理跨天逻辑
            for (const key in state.withdrawTimeConfigMap) {
                if (Object.hasOwnProperty.call(state.withdrawTimeConfigMap, key)) {
                    const el = state.withdrawTimeConfigMap[key]
                    if (!isEmpty(el.openTime)) {
                        const timeRange = el.openTime.split(',')
                        if (timeRange.length > 0) {
                            timeRange.forEach(timeRangeItem => {
                                const [start, end] = timeRangeItem.split('-')
                                const startLocal = window.dayjs.utc(`${todayStr} ${start}`).local()
                                const endLocal = window.dayjs.utc(`${todayStr} ${end}`).local()

                                // 第二天
                                const weekDay = key < 7 ? Number(key) + 1 : 1
                                let elNext = state.withdrawTimeConfigMap[weekDay]

                                if (!elNext) {
                                    elNext = {
                                        openTimeLocal: [],
                                        weekDay
                                    }
                                    state.withdrawTimeConfigMap[weekDay] = elNext
                                }

                                if (startLocal.isAfter(todayStr, 'day')) {
                                    elNext.openTimeLocal.push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
                                } else if (endLocal.format('HH:mm') === '00:00') {
                                    el.openTimeLocal.push(startLocal.format('HH:mm') + '-24:00')
                                } else if (endLocal.isAfter(todayStr, 'day')) {
                                    elNext.openTimeLocal.unshift('00:00-' + endLocal.format('HH:mm'))
                                    el.openTimeLocal.push(startLocal.format('HH:mm') + '-23:59')
                                } else if (el.openTime !== '00:00-00:00' || el.openTime !== '') {
                                    el.openTimeLocal.push(startLocal.format('HH:mm') + '-' + endLocal.format('HH:mm'))
                                }
                            })
                        }
                    }
                }
            }

            // 处理时间合并
            for (const key in state.withdrawTimeConfigMap) {
                if (Object.hasOwnProperty.call(state.withdrawTimeConfigMap, key)) {
                    const el = state.withdrawTimeConfigMap[key]
                    if (Array.isArray(el.openTimeLocal)) {
                        el.openTimeLocal.forEach((time, index) => {
                            const start = el.openTimeLocal[0].split('-')[0]

                            const end = time.split('-')[1]
                            const nextStart = el.openTimeLocal[index + 1] && el.openTimeLocal[index + 1].split('-')[0]
                            const nextEnd = el.openTimeLocal[index + 1] && el.openTimeLocal[index + 1].split('-')[1]

                            if (window.dayjs(`${todayStr} ${end}`).add(1, 'minute').isSame(window.dayjs(`${todayStr} ${nextStart}`)) ||
                                end === nextStart
                            ) {
                                el.openTimeLocal = start + '-' + nextEnd
                            }
                        })
                    }
                }
            }
        }

        const openSheet = () => {
            state.show = true
        }

        // 选择银行卡
        const chooseBank = (item) => {
            state.withdrawCurrency = item.bankCurrency
            state.checkedBank = item
            state.bankList.map(item => {
                item.checked = false
            })
            item.checked = true
            state.show = false

            // 数据初始化
            init()
            // 获取取款汇率
            getWithdrawRate()
        }

        const toAddBank = () => {
            router.push('addBank')
        }

        // 全部取出
        const getAll = () => {
            // otc365_cny限制最多输入4位小数位
            if (currentTab === 'otc365_cny') {
                state.amount = retainDecimal(state.withdrawConfig.withdrawAmount, 4)
            } else {
                state.amount = state.withdrawConfig.withdrawAmount
            }
            // 获取取款手续费
            getWithdrawFee()
        }

        // 改变取款金额
        const changeAmount = () => {
            // otc365_cny限制最多输入4位小数位
            if (currentTab === 'otc365_cny') {
                if (getDecimalNum(state.amount) > 4) {
                    state.amount = retainDecimal(state.amount, 4)
                }
            }
            // 获取取款手续费
            getWithdrawFee()
        }

        // 获取取款汇率
        const getWithdrawRate = () => {
            const params = {
                companyId: customInfo.value.companyId,
                customerNo: customInfo.value.customerNo,
                accountId,
                tradeType,
                accountCurrency: accountCurrency.currency,
                withdrawCurrency: currency,
                withdrawType: 1
            }
            queryWithdrawRate(params).then(res => {
                if (res.check()) {
                    state.withdrawRate = res.data
                }
            })
        }

        // 获取取款限制配置
        const getWithdrawConfig = () => {
            const params = {
                companyId: customInfo.value.companyId,
                customerNo: customInfo.value.customerNo,
                accountId,
                customerGroupId: customInfo.value.customerGroupId,
                accountCurrency: accountCurrency.currency,
                withdrawCurrency: currency,
                country: customInfo.value.country,
                withdrawType: 1,
                withdrawMethod: currentTab,
                tradeType
            }

            queryWithdrawConfig(params).then(res => {
                if (res.check()) {
                    const { data } = res
                    state.withdrawConfig = data
                    state.withdrawAmount = data.withdrawAmount
                    state.singleHighAmount = data.withdrawAmountConfig.singleHighAmount
                    state.singleLowAmount = data.withdrawAmountConfig.singleLowAmount

                    if (!res.data.customerGroupEnable) {
                        return Dialog.confirm({
                            title: t('withdraw.hint'),
                            message: t('withdraw.withdrawLimitHint'),
                            confirmButtonText: t('withdraw.contact'),
                            cancelButtonText: t('withdraw.close')
                        }).then(() => {
                            if (onlineServices.value) { location.href = onlineServices.value }
                        })
                    } else {
                        // 检测取款是否需要kyc
                        checkKyc()
                    }

                    // 时区转换
                    transferUtc()
                } else {
                    Toast(res.msg)
                }
            })
        }

        const getBankList = async () => {
            state.loading = true
            await queryBankList().then(res => {
                state.loading = false
                if (res.check()) {
                    if (res.data && res.data.length > 0) {
                        state.bankList = res.data // .filter(el => el.bankCurrency === currency)
                        state.checkedBank = state.bankList.filter(el => el.bankCurrency === currency)[0]
                        state.checkedBank.checked = true
                        state.withdrawCurrency = state.checkedBank.bankCurrency
                        // 获取取款汇率
                        getWithdrawRate()
                    }
                }
            }).catch(err => {
                state.loading = false
            })
        }

        // 处理银行卡号显示
        const hideMiddle = (value) => {
            if (!isEmpty(value)) { return `${value.substring(0, 4)} ${'*'.repeat(value.length - 8).replace(/(.{4})/g, '$1 ')}${value.length % 4 ? ' ' : ''}${value.slice(-4)}` }
        }

        const getGooleVerifyCode = val => {
            state.googleCode = val
        }

        const checkKyc = () => {
            state.loading = true
            checkKycApply({
                businessCode: 'withdraw',
                openAccountType: customInfo.value.openAccountType
            }).then(res => {
                state.loading = false
                if (Number(res.data) !== 2) {
                    return Dialog.alert({
                        title: t('withdraw.hint'),
                        confirmButtonText: Number(res.data) === 1 ? t('withdraw.kycBtn_1') : t('withdraw.kycBtn_2'),
                        message: Number(res.data) === 2 ? t('withdraw.kycMsg_1') : t('withdraw.kycMsg_2'),
                    }).then(() => {
                        if (customInfo.value.openAccountType === 0) {
                            router.replace({
                                path: '/assets/authentication',
                                query: {
                                    businessCode: 'withdraw'
                                }
                            })
                        } else {
                            router.replace({
                                path: '/businessKYC'
                            })
                        }
                    })
                } else {
                    if (!state.withdrawConfig.accountActiveEnable) {
                        return Dialog.confirm({
                            title: t('withdraw.hint'),
                            message: t('withdraw.activateMsg'),
                            confirmButtonText: t('withdraw.activateBtn')
                        }).then(() => {
                            router.replace({
                                path: '/assets/depositChoose',
                                query: {
                                    tradeType,
                                    accountId,
                                    currency: accountCurrency.currency
                                }
                            })
                        }).catch(() => {
                            // on cancel
                        })
                    }

                    if (!state.withdrawConfig.timeEnable) {
                        state.timeShow = true
                        return
                    }

                    if (!state.withdrawConfig.amountEnable) {
                        return Toast(t('withdrawMoney.hint_6'))
                    }

                    if (!state.withdrawConfig.hourIn24Enable) {
                        return Toast(t('withdrawMoney.hint_7') + state.withdrawConfig.withdrawBaseConfig.maxCount + t('withdrawMoney.unit'))
                    }
                }
            }).catch(err => {
                state.loading = false
            })
        }

        // 获取提现方式
        const getWithdrawMethods = () => {
            getWithdrawMethodList({
                companyId: customInfo.value.companyId,
                customerNo: customInfo.value.customerNo,
                customerGroupId: customInfo.value.customerGroupId,
                customerId: customInfo.value.id,
                country: customInfo.value.country,
                tradeType,
                accountId
            }).then(res => {
                if (res.check()) {
                    res.data.map(elem => {
                        if (elem.withdrawMethod === currentTab) {
                            state.extend = elem.extend
                        }
                    })
                }
            })
        }

        // 补充资料是否全部填写完成
        const checkAllComplete = () => {
            let flag = true
            const extend = state.extend
            for (const key in extend) {
                if (Object.hasOwnProperty.call(extend, key)) {
                    const element = extend[key]
                    if (isEmpty(element.value)) {
                        flag = false
                    }
                }
            }
            return flag
        }

        // 补充资料确定事件
        const handleAppendField = () => {
            const extend = state.extend
            for (const key in extend) {
                if (Object.hasOwnProperty.call(extend, key)) {
                    const element = extend[key]
                    if (isEmpty(element.value)) {
                        return Toast(t('deposit.allInputRequire'))
                    }
                    if (!isEmpty(element.regex)) {
                        const valueReg = new RegExp(element.regex)
                        if (!valueReg.test(element.value)) {
                            return Toast(`${element[state.lang]}` + t('register.incorrectlyFormed'))
                        }
                    }
                    state.paramsExtens[key] = element.value
                }
            }
            state.appendVis = false

            // 发起提现
            launchHandleWithdraw()
        }

        // 点击确定提现
        const confirm = () => {
            const amount = parseFloat(state.amount)
            const withdrawAmount = parseFloat(state.withdrawAmount)
            const amountDigitsLength = state.amount.toString().split('.')[1] ? state.amount.toString().split('.')[1].length : 0
            if (!amount) {
                return Toast(t('withdrawMoney.hint_1'))
            }
            if (isEmpty(state.checkedBank)) {
                return Toast(t('withdrawMoney.hint_2'))
            }
            if (amount < parseFloat(state.singleLowAmount)) {
                return Toast(`${t('withdrawMoney.hint_3')}${state.singleLowAmount}`)
            }
            if (amount > parseFloat(state.singleHighAmount)) {
                return Toast(`${t('withdrawMoney.hint_4')}${state.singleHighAmount}`)
            }

            if (amountDigitsLength > accountCurrency.digits) {
                return Toast(t('withdraw.withdrawDigitsTip'))
            }
            if (amount > withdrawAmount) {
                return Toast(t('withdrawMoney.hint_5'))
            }
            if (!state.pwd) {
                return Toast(t('common.inputFundPwd'))
            }
            if (googleCodeVis.value && isEmpty(state.googleCode)) {
                return Toast(t('common.inputGoogleCode'))
            }

            // 取款方式为otc365_cny判断是否需要填写补充资料
            if (currentTab === 'otc365_cny' && !isEmpty(state.extend) && !checkAllComplete()) {
                state.appendVis = true
                return
            }

            // 发起提现
            launchHandleWithdraw()
        }

        // 创建取款提案
        const launchHandleWithdraw = () => {
            state.loading = true
            const params = {
                accountId,
                accountCurrency: accountCurrency.currency,
                withdrawCurrency: currency,
                amount: state.amount,
                rate: state.withdrawRate.exchangeRate,
                withdrawRateSerialNo: state.withdrawRate.withdrawRateSerialNo,
                bankAccountName: state.checkedBank.lastName + state.checkedBank.firstName,
                bankName: state.checkedBank.bankName,
                bankCardNo: state.checkedBank.bankCardNumber,
                withdrawType: 1,
                withdrawMethod: currentTab,
                tradeType,
                fundPwd: md5(state.pwd),
                googleCode: state.googleCode
            }
            if (!isEmpty(state.paramsExtens)) {
                params.extend = JSON.stringify(state.paramsExtens)
            }
            handleWithdraw(params).then(res => {
                state.loading = false
                if (res.check()) {
                    state.amount = ''
                    state.withdrawSuccess = true
                }
            }).catch(err => {
                state.loading = false
            })
        }

        onBeforeMount(() => {
            // 获取提现方式
            getWithdrawMethods()
            new Promise(resolve => {
                // 获取银行卡列表
                getBankList()
                resolve()
            }).then(() => {
                // 获取取款限制配置
                getWithdrawConfig()
            })
            store.commit('_user/Update_account', accountId)
        })

        return {
            ...toRefs(state),
            rightClick,
            openSheet,
            chooseBank,
            getAll,
            toAddBank,
            goFundForgot,
            changeAmount,
            confirm,
            currency,
            customInfo,
            hideMiddle,
            getWithdrawFee,
            timeList,
            onlineServices,
            isEmpty,
            accountCurrency,
            handleAppendField,
            googleCodeVis,
            getGooleVerifyCode
        }
    }

}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.pageWrap {
    padding-top: rem(90px);
    background: var(--contentColor);
    .empty {
        height: rem(20px);
        background-color: var(--bgColor);
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: rem(40px) rem(30px);
    }
    .pageTitle {
        margin-bottom: rem(10px);
        font-weight: normal;
        font-size: rem(50px);
    }
    .wrap {
        padding: 0 rem(30px);
        .header-text {
            margin-top: rem(46px);
            margin-bottom: rem(73px);
            color: var(--color);
            font-size: rem(28px);
        }
        .field-wrap {
            display: flex;
            padding-bottom: rem(18px);
            border-bottom: solid 1px var(--lineColor);
            input {
                flex: 1;
            }
            .get-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: rem(168px);
                height: rem(60px);
                font-size: rem(24px);
                line-height: rem(60px);
                background-color: var(--primaryAssistColor);
                border: 1px solid var(--lineColor);
                border-radius: rem(30px);
                cursor: pointer;
            }
        }
        .notice {
            display: flex;
            margin-top: rem(30px);
            margin-bottom: rem(40px);
            .can-name {
                flex: 1;
            }
            span {
                color: var(--minorColor);
                font-size: rem(24px);
            }
        }
        .bank-wrap {
            margin-top: rem(20px);
            .bw-t {
                color: var(--color);
                font-size: rem(28px);
                line-height: rem(72px);
            }
            .bw-t2 {
                color: var(--minorColor);
                font-size: rem(24px);
                line-height: rem(60px);
            }
        }
        .fund,
        .field-google {
            margin-top: rem(20px);
            .bw-t {
                color: var(--color);
                font-size: rem(28px);
            }
            .fund-input {
                display: flex;
                align-items: center;
                .input-comp {
                    flex: 1;
                }
                .href {
                    color: var(--primary);
                    vertical-align: middle;
                    cursor: pointer;
                }
            }
        }
        .field-google :deep() {
            .paste {
                display: none;
            }
        }
    }
}
.confirm-btn {
    position: absolute;
    bottom: 0;
    height: rem(104px);
    background: var(--bgColor);
    border-color: var(--lineColor);
    span {
        color: var(--color);
        font-weight: bold;
        font-size: rem(30px);
    }
}
.bank {
    align-items: center;
    margin: rem(10px) rem(10px) rem(10px) 0;
    border: rem(1px) solid var(--lineColor);
    cursor: pointer;
    &.disabled {
        pointer-events: none;
        .bank-no {
            color: var(--placeholdColor);
        }
    }
    &.bank-flex {
        display: flex;
        justify-content: center;
    }
    .bank-item {
        display: flex;
        align-items: center;
        border-radius: rem(4px);
    }
    .tips {
        //padding: 0 rem(90px) rem(20px);
        color: var(--placeholdColor);
    }
    .bank-no {
        flex: 1;
    }
    .bank-icons-sm {
        margin: rem(30px) rem(15px) rem(30px) rem(30px);
    }
    .van-icon {
        height: rem(40px);
        margin-right: rem(20px);
    }
    &.no-data {
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: rem(90px);
        span {
            margin-left: rem(30px);
            color: var(--minorColor);
            vertical-align: middle;
        }
        .van-button {
            padding: 0 rem(20px);
            vertical-align: middle;
        }
    }
}
.bank-list .bank {
    border-color: var(--lineColor);
    border-style: solid;
    border-width: 0 0 1px;
}
.add-bank {
    display: flex;
    align-items: center;
    height: rem(96px);
    .icon-plus {
        margin: rem(20px) rem(20px) rem(20px) rem(45px);
        vertical-align: middle;
    }
    span {
        flex: 1;
        vertical-align: middle;
    }
    .icon-arrow {
        margin-right: rem(30px);
    }
}
</style>

<style lang="scss">

.add-success {
    padding: rem(30px) rem(30px) 0 rem(30px);
    text-align: center;
    .icon_success {
        color: var(--success);
        font-size: rem(96px);
    }
    .title {
        line-height: rem(80px);
    }
    .content {
        margin: rem(20px) 0;
        color: var(--minorColor);
        font-size: rem(28px);
    }
}
.time-wrap {
    padding: 0 rem(30px);
    font-size: rem(28px);
    h4 {
        margin: rem(15px) 0;
    }
    .flex {
        display: flex;
        .time-text {
            flex: 1;
            .time-text-flex {
                display: flex;
                margin-top: rem(10px);
                .time-label {
                    flex: 1;
                }
                .time-val {
                    flex: 3;
                }
            }
        }
    }
}
// 补充资料弹窗
.append-popup {
    .append-wrap {
        text-align: center;
        .title {
            padding: rem(60px) 0;
            color: var(--color);
            font-size: rem(32px);
            text-align: center;
        }
        .btn {
            width: 80%;
            margin: rem(50px) auto;
        }
    }
}

@import '@/sass/mixin.scss';
</style>
