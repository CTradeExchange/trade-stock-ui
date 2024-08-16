<template>
    <router-view />
    <div ref='containerRef' class='rankingWrapper'>
        <div class='topTool'>
            <a class='back' href='javascript:;' @click='$router.back()'>
                <van-icon name='arrow-left' />
            </a>
            <h2 class='title'>
                {{ $t('route.ranking') }}
            </h2>
        </div>
        <div class='ranking'>
            <rankingModule :index-column='true' :max='30' type='moduleList' />
        </div>
    </div>
</template>

<script>
import rankingModule from '@planspc/modules/ranking/rankingModule'
import { onMounted, ref } from 'vue'
export default {
    components: {
        rankingModule,
    },
    setup () {
        const containerRef = ref(null)
        const calcHeight = () => {
            const footerEl = document.querySelector('.footer-nav')
            const _footerHeight = footerEl.clientHeight
            const headerEl = document.querySelector('.header-nav')
            const headerHeight = headerEl.clientHeight
            const winHeight = window.innerHeight
            const contanierHeight = winHeight - headerHeight - _footerHeight
            return contanierHeight
        }
        onMounted(() => {
            containerRef.value.style.minHeight = calcHeight() - 80 + 'px'
        })
        return {
            containerRef
        }
    }
}
</script>

<style lang="scss" scoped>
.rankingWrapper {
    width: 1200px;
    margin: 40px auto;
    // min-height: calc(100vh - 100px);
    .topTool {
        position: relative;
        line-height: 40px;
        .title {
            margin-left: 30px;
            height: 40px;
            font-size: 24px;
        }
        .back {
            position: absolute;
            left: 0;
            top: 0;
            font-size: 24px;
            color: var(--color);
        }
    }
}
.ranking {
    position: relative;
    margin: 30px 0 60px;
    padding: 10px 20px 0;
    background: var(--contentColor);
    border-radius: 5px;
    font-size: 12px;
    :deep(.productItem) {
        padding: 10px 6px !important;
    }
}
</style>
