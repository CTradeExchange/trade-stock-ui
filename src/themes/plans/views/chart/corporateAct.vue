<template>
    <div class='contractWrapper'>
        <top />
        <div class='container'>
            <van-pull-refresh
                v-model='refreshing'
                :loading-text="$t('compLang.loading')"
                :loosing-text="$t('compLang.vanPullRefresh.loosing')"
                :pulling-text="$t('compLang.vanPullRefresh.pulling')"
                @refresh='onRefresh'
            >
                <van-list
                    v-model:loading='loading'
                    :finished='finished'
                    :immediate-check='false'
                    :loading-text="$t('compLang.loading')"
                    @load='onLoad'
                >
                    <van-cell
                        v-for='(item, index) in list'
                        :key='index'
                        :label='item.actionInfo'
                        :title="$t('corporateAct.exDividendDate')"
                        value=''
                    />
                    <div v-show='loading === false && list.length === 0'>
                        <van-empty :description='$t("common.noData")' image='/images/empty.png' />
                    </div>
                </van-list>
            </van-pull-refresh>
        </div>
    </div>
</template>

<script>
import top from '@plans/layout/top'
import { queryMorePageListBySymbolId } from '@/api/trade'
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
    components: {
        top,
    },
    setup () {
        const route = useRoute()
        const { query } = route
        const list = ref([]) // 列表
        const loading = ref(false) // 是否loading
        const finished = ref(false) // 是否加载完毕
        const refreshing = ref(false) // 是否刷新
        const pagigation = reactive({
            size: 20,
            current: 1,
        })

        const getPageList = () => {
            const params = {
                symbolId: query.symbolId,
                size: pagigation.size,
                current: pagigation.current
            }
            // 拉取行动列表
            return queryMorePageListBySymbolId(params).then((res) => {
                if (res.check() && res.data) {
                    const { current, size, total, records } = res.data
                    pagigation.current = current
                    pagigation.size = size
                    list.value = [
                        ...list.value,
                        ...records,
                    ]
                    finished.value = (current >= total)
                }
                loading.value = false
            }).catch(err => {
                loading.value = false
            })
        }

        const onLoad = () => {
            if (finished.value) {
                pagigation.current += 1
                getPageList()
            }
        }
        const onRefresh = () => {
            // 清空列表数据
            pagigation.current = 1
            finished.value = false
            loading.value = false
            list.value = []
            getPageList()
        }

        onMounted(() => {
            getPageList()
        })

        return {
            onLoad,
            onRefresh,
            list,
            loading,
            refreshing,
            finished,
            pagigation
        }
    }
}
</script>

<style lang="scss" scoped>
@import "@/sass/mixin.scss";
.container {
    flex: 1;
    padding-top: rem(100px);
    overflow-y: auto;
    background-color: var(--bgColor);
    :deep(.van-cell__value) {
        flex: 0
    }
}
</style>
