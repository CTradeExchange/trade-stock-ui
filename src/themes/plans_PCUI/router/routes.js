import themeRouter from '@/themeCommon/router'
import Layout from '../layout/index'
// import popupLayout from '../layout/popupLayout'

const h5Children = [{
    path: 'bindEmail', // 绑定邮箱
    component: () =>
        import(/* webpackChunkName: "Setting" */ '../views/setting/bindEmail.vue'),
    meta: {
        title: 'cRoute.bindEmail',
        footerMenu: false,
    }
},
{
    path: 'bindMobile', // 绑定手机
    component: () =>
        import(/* webpackChunkName: "Setting" */ '../views/setting/bindMobile.vue'),
    meta: {
        title: 'cRoute.bindMobile',
        footerMenu: false,
    }
},
{
    path: 'setLoginPwd', // 设置密码
    component: () =>
        import(/* webpackChunkName: "setLoginPwd" */ '../views/setting/setLoginPwd.vue'),
    meta: {
        title: 'cRoute.setLoginPwd',
        roles: ['User']
    }
},
{
    path: 'setFundPwd', // 设置资金密码
    component: () =>
        import(/* webpackChunkName: "setLoginPwd" */ '../views/setting/setFundPwd.vue'),
    meta: {
        title: 'cRoute.setFundPwd',
        roles: ['User']
    }
},
{
    path: 'bankList',
    component: () =>
        import(/* webpackChunkName: "bankList" */ '../views/user/bankList.vue'),
    meta: {
        title: 'cRoute.bankList',
        roles: ['User']
    }
},
{
    path: 'addBank',
    component: () =>
        import(/* webpackChunkName: "addBank" */ '../views/user/addBank.vue'),
    meta: {
        title: 'cRoute.addBank',
        roles: ['User']
    }
},
{
    path: 'authentication',
    // name: 'Authentication',
    component: () =>
        import(/* webpackChunkName: "addBank" */ '../views/user/authentication.vue'),
    meta: {
        title: 'cRoute.authentication',
        // roles: ['User']
    }
},
{
    path: 'authForm',
    component: () =>
        import(/* webpackChunkName: "addBank" */ '../views/user/authForm.vue'),
    meta: {
        title: 'cRoute.authForm',
        // roles: ['User']
    }
},
{
    path: 'kycCommitted',
    // name: 'KycCommitted',
    component: () =>
        import(/* webpackChunkName: "addBank" */ '../views/user/kycCommitted.vue'),
    meta: {
        title: 'cRoute.kycCommitted',
        // roles: ['User']
    }
},
{
    path: 'contract',
    component: () =>
        import(/* webpackChunkName: "contract" */ '../views/contract/contract.vue'),
    meta: {
        title: '',
        roles: ['User']
    }
},
{
    path: 'transfer', // 划转
    component: () =>
        import(/* webpackChunkName: "transfer" */ '../views/transfer/transfer.vue'),
    meta: {
        title: 'route.transfer',
        roles: ['User']
    }
},
{
    path: 'chooseAccount', // 选择币种
    component: () =>
        import(/* webpackChunkName: "chooseAccount" */ '../views/chooseAccount/chooseAccount.vue'),
    meta: {
        title: 'cRoute.chooseCurrency',
        roles: ['User']
    }
},
{
    path: 'depositChoose', // 选择充值方式
    component: () =>
        import(/* webpackChunkName: "deposit" */ '../views/deposit/choose.vue'),
    meta: {
        title: 'cRoute.deposit',
        roles: ['User']
    }
},
{
    path: 'depositDirect', // 直充
    component: () =>
        import(/* webpackChunkName: "deposit" */ '../views/deposit/direct.vue'),
    meta: {
        title: 'cRoute.deposit',
        roles: ['User']
    }
},
{
    path: 'deposit', // 汇兑
    component: () =>
        import(/* webpackChunkName: "deposit" */ '../views/deposit/deposit.vue'),
    meta: {
        title: 'cRoute.deposit',
        roles: ['User']
    }
},
{
    path: 'depositRecord', // 入金记录
    component: () =>
        import(/* webpackChunkName: "deposit" */ '../views/deposit/depositRecord.vue'),
    meta: {
        title: 'cRoute.depositRecord',
        roles: ['User']
    }
},
{
    path: 'depositCb', // 入金结果
    component: () =>
        import(/* webpackChunkName: "deposit" */ '../views/deposit/depositCb.vue'),
    meta: {
        title: 'cRoute.despositCb',
        roles: ['User']
    }
},
{
    path: 'withdrawAccount', // 选择提现币种
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/withdrawAccount.vue'),
    meta: {
        title: 'cRoute.withdrawAccount',
        roles: ['User']
    }
},
{
    path: 'withdrawMoney', // 提现
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/withdrawMoney.vue'),
    meta: {
        title: 'cRoute.withdraw',
        roles: ['User']
    }
},
{
    path: 'withdrawCoin', // 提币
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/withdrawCoin.vue'),
    meta: {
        title: 'cRoute.withdraw',
        roles: ['User']
    }
},
{
    path: 'withdrawRedeem', // 提现Payredeem
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/withdrawRedeem.vue'),
    meta: {
        title: 'cRoute.withdraw',
        roles: ['User']
    }
},
{
    path: 'pay8Account',
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/pay8Account.vue'),
    meta: {
        title: 'cRoute.withdraw',
        roles: ['User']
    }
},
{
    path: 'pay8Bank',
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/pay8Bank.vue'),
    meta: {
        title: 'cRoute.withdraw',
        roles: ['User']
    }
},
{
    path: 'withdrawRecord',
    component: () =>
        import(/* webpackChunkName: "withdrawAccount" */ '../views/withdraw/withdrawRecord.vue'),
    meta: {
        title: 'cRoute.withdrawRecord',
        roles: ['User']
    }
},
{
    path: 'authentication', // 身份认证
    component: () =>
        import(/* webpackChunkName: "authentication" */ '../views/authentication/authentication.vue'),
    meta: {
        title: 'cRoute.authentication',
    }
},
{
    path: 'walletAdd', // 添加钱包
    component: () =>
        import(/* webpackChunkName: "Bank" */ '../views/wallet/walletAdd.vue'),
    meta: {
        title: 'cRoute.walletAdd',
        roles: ['User']
    }
},
{
    path: 'walletAddress', // 添加钱包
    component: () =>
        import(/* webpackChunkName: "Bank" */ '../views/wallet/walletAddress.vue'),
    meta: {
        title: 'cRoute.walletAdd',
        roles: ['User']
    }
},
{
    path: 'loan', // 借款
    component: () =>
        import(/* webpackChunkName: "loan" */ '../views/loan/loan.vue'),
    meta: {
        title: 'route.loan',
        roles: ['User']
    }
},
{
    path: 'returnMoney', // 还款
    component: () =>
        import(/* webpackChunkName: "returnMoney" */ '../views/returnMoney/returnMoney.vue'),
    meta: {
        title: 'route.returnMoney',
        roles: ['User']
    }
},
{
    path: 'record', // 资金记录
    component: () =>
        import(/* webpackChunkName: "returnMoney" */ '../views/record/record.vue'),
    meta: {
        title: 'route.records',
        roles: ['User']
    }
},
{
    path: 'regKyc', // 注册KYC
    component: () =>
        import(/* webpackChunkName: "RegKyc" */ '../views/register/regKyc.vue'),
    meta: {
        title: 'route.RegKyc',
    }
},
{
    path: 'googleMFA/status',
    component: () =>
        import(/* webpackChunkName: "google_MFA" */ '../views/google_MFA/status.vue'),
    meta: {
        title: 'route.MFA_status',
    }
},
{
    path: 'googleMFA/install',
    component: () =>
        import(/* webpackChunkName: "google_MFA" */ '../views/google_MFA/install.vue'),
    meta: {
        title: 'route.MFA_status',
    }
},
{
    path: 'googleMFA/secretKey',
    component: () =>
        import(/* webpackChunkName: "google_MFA" */ '../views/google_MFA/secretKey.vue'),
    meta: {
        title: 'route.MFA_bind',
    }
},
{
    path: 'googleMFA/bind',
    component: () =>
        import(/* webpackChunkName: "google_MFA" */ '../views/google_MFA/bind.vue'),
    meta: {
        title: 'route.MFA_bind',
    }
},
{
    path: 'googleSecurityCheck/index',
    component: () =>
        import(/* webpackChunkName: "googleSecurityCheck" */ '../views/googleSecurityCheck/index.vue'),
    meta: {
        title: 'route.MFA_check',
    }
},
{
    path: 'api/createSuccess',
    component: () =>
        import(/* webpackChunkName: "googleSecurityCheck" */ '../views/api/createSuccess.vue'),
    meta: {
        title: 'api.createTitle',
    }
},
{
    path: 'corporateAct',
    component: () => import(/* webpackChunkName: "corporateAct" */ '../views/order/pages/components/corporateAct/corporateAct.vue'),
    meta: {
        title: 'route.corporateAct',
    }
},
]
const route404 = [
    // 所有不存在404路由地址，导航到首页
    { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const routes = [
    ...route404,
    ...themeRouter,
    {
        path: '/login',
        name: 'Login',
        component: () =>
            import(/* webpackChunkName: "Login" */ '../views/login/login.vue'),
        meta: {
            title: 'route.login',
            roles: [],
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: () =>
            import(/* webpackChunkName: "Register" */ '../views/register/register.vue'),
        meta: {
            title: 'route.register',
            roles: [],
        },
        children: h5Children
    },
    {
        path: '/register/success',
        name: 'RegisterSuccess',
        component: () =>
            import(/* webpackChunkName: "Register" */ '../views/register/registerSuccess.vue'),
        meta: {
            title: 'route.registerSuccess',
            roles: [],
        },
        children: h5Children
    },
    {
        path: '/forgot',
        name: 'Forgot',
        component: () =>
            import(/* webpackChunkName: "Forgot" */ '../views/forgot/forgot.vue'),
        meta: {
            title: 'route.forgot',
            roles: [],
        },
        children: h5Children
    },
    {
        path: '/resetPwd',
        name: 'ResetPwd',
        component: () =>
            import(/* webpackChunkName: "Forgot" */ '../views/forgot/resetPwd.vue'),
        meta: {
            title: 'route.resetPwd',
            // keepAlive: true,
            roles: [],
        }
    },
    {
        path: '/resetFundPwd',
        name: 'ResetFundPwd',
        component: () =>
            import(/* webpackChunkName: "Forgot" */ '../views/forgot/resetFundPwd.vue'),
        meta: {
            title: 'route.resetFundPwd',
            // keepAlive: true,
            roles: [],
        },
        children: h5Children
    },

    {
        path: '/resetSuccess',
        name: 'ResetSuccess',
        component: () =>
            import(/* webpackChunkName: "resetSuccess" */ '../views/forgot/resetSuccess.vue'),
        meta: {
            title: 'cRoute.resetPwdSuccess'
        }
    },
    {
        path: '/resetFail',
        name: 'ResetFail',
        component: () =>
            import(/* webpackChunkName: "resetFail" */ '../views/forgot/resetFail.vue'),
        meta: {
            title: 'cRoute.resetPwdFaid'
        }
    },
    {
        path: '/',
        redirect: '/quote',
        name: 'Layout',
        component: Layout,
        // keepAlive: true,
        children: [{
            path: 'home',
            name: 'Home',
            redirect: '/quote',
            component: () =>
                import(/* webpackChunkName: "Home" */ '../views/home/home.vue'),
            meta: {
                title: 'route.home',
                // keepAlive: true,
                roles: [],
            },
            children: h5Children
        },
        {
            path: 'quote',
            name: 'Quote',
            component: () =>
                import(/* webpackChunkName: "Quote" */ '../views/quote/quote.vue'),
            meta: {
                title: 'route.quote',
                roles: [],
            },
            children: h5Children
        },
        {
            path: 'order',
            name: 'Order',
            component: () =>
                import(/* webpackChunkName: "Order" */ '../views/order/order.vue'),
            meta: {
                title: 'route.order',
                roles: [],
            },
            children: h5Children
        },
        {
            path: 'assets',
            name: 'Assets',
            component: () =>
                import(/* webpackChunkName: "Assets" */ '../views/assets/assets.vue'),
            meta: {
                title: 'route.assets',
                roles: []
            },
            children: h5Children
        },
        {
            path: 'transRecords',
            name: 'TransRecords',
            component: () =>
                import(/* webpackChunkName: "TransRecords" */ '../views/transRecords/transRecords.vue'),
            meta: {
                title: 'route.transRecords',
                roles: [],
            },
            children: h5Children
        },
        {
            path: 'fees',
            name: 'Fees',
            component: () =>
                import(/* webpackChunkName: "footerUrlPage" */ '../views/footerUrlPage/fees/index.vue'),
            meta: {
                title: '',
            },
            children: h5Children
        },
        {
            path: 'about',
            name: 'About',
            component: () =>
                import(/* webpackChunkName: "footerUrlPage" */ '../views/footerUrlPage/aboutUs/index.vue'),
            meta: {
                title: '',
            },
            children: h5Children
        },
        {
            path: 'fund',
            name: 'Fund',
            component: () =>
                import(/* webpackChunkName: "returnMoney" */ '../views/funds/index.vue'),
            meta: {
                title: '',
            },
            children: h5Children
        },
        {
            path: 'fundManager', // 基金操作专区
            name: 'FundManager',
            component: () =>
                import(/* webpackChunkName: "returnMoney" */ '../views/fundManager/index.vue'),
            meta: {
                title: 'route.fundManager',
                roles: ['User']
            },
            children: h5Children
        },
        {
            path: 'businessKYC/index',
            name: 'BusinessKYC',
            component: () =>
                import(/* webpackChunkName: "businessKYC" */ '../views/businessKYC/index.vue'),
            meta: {
                title: '企业KYC',
            },
            children: h5Children
        },
        {
            path: 'businessKYC',
            name: 'BusinessKYCList',
            component: () =>
                import(/* webpackChunkName: "businessKYC" */ '../views/businessKYC/kycList.vue'),
            meta: {
                title: '企业KYC',
            },
            children: h5Children
        },
        {
            path: '/businessKYC/content',
            name: 'BusinessKYCContent',
            component: () =>
                import(/* webpackChunkName: "businessKYC" */ '../views/businessKYC/content.vue'),
            meta: {
                title: '企业KYC',
            },
            children: h5Children
        },
        {
            path: '/download',
            name: 'Download',
            component: () =>
                import(/* webpackChunkName: "resetFail" */ '../views/download/index.vue'),
            meta: {
                title: 'route.download'
            }
        },
        {
            path: '/ranking',
            name: 'Ranking',
            component: () =>
                import(/* webpackChunkName: "resetFail" */ '../views/ranking/ranking.vue'),
            meta: {
                title: 'route.ranking'
            }
        },
        {
            path: '/api',
            name: 'Api',
            component: () =>
                import(/* webpackChunkName: "api" */ '../views/api/api.vue'),
            meta: {
                title: 'route.api'
            },
            children: h5Children
        },
        {
            path: '/apiEdit',
            name: 'ApiEdit',
            component: () =>
                import(/* webpackChunkName: "api" */ '../views/api/edit.vue'),
            meta: {
                title: 'route.api'
            },
            children: h5Children
        },
        {
            path: '/notice',
            name: 'Notice',
            component: () =>
                import(/* webpackChunkName: "api" */ '../views/notice/index.vue'),
            meta: {
                title: 'route.noticeTitle'
            },
            children: h5Children
        },
        {
            path: '/noticeDetail',
            name: 'NoticeDetail',
            component: () =>
                import(/* webpackChunkName: "api" */ '../views/notice/detail.vue'),
            meta: {
                title: 'route.noticeTitle'
            },
            children: h5Children
        },
        {
            path: '/randomKey',
            name: 'RandomKey',
            component: () =>
                import(/* webpackChunkName: "randomKey" */ '../views/randomKey/randomKey.vue'),
            meta: {
                title: ''
            },
        },
        // {
        //     path: '/barrage',
        //     name: 'Barrage',
        //     component: () =>
        //         import(/* webpackChunkName: "api" */ '../views/barrage/index.vue'),
        //     meta: {
        //         title: 'Barrage弹幕'
        //     },
        //     children: h5Children
        // },
        // {
        //     path: '/web3',
        //     name: 'Web3',
        //     component: () =>
        //         import(/* webpackChunkName: "api" */ '../views/web3test/web3.vue'),
        //     meta: {
        //         title: 'web3'
        //     },
        //     children: h5Children
        // },
        {
            path: '/fundDEX',
            name: 'fundDEX',
            redirect: '/dashboard',
            component: () =>
                import(/* webpackChunkName: "api" */ '@/themeCommon/user/fundDEX/components/layout.vue'),
            children: [
                {
                    path: '/dashboard',
                    name: 'Dashboard',
                    component: () =>
                        import(/* webpackChunkName: "api" */ '@/themeCommon/user/fundDEX/dashboard/index.vue'),
                    meta: {
                        title: ''
                    },
                    children: h5Children
                },
                {
                    path: '/earning',
                    name: 'Earning',
                    component: () =>
                        import(/* webpackChunkName: "api" */ '@/themeCommon/user/fundDEX/staking/index.vue'),
                    meta: {
                        title: ''
                    },
                    children: h5Children
                },
                {
                    path: '/earning/detail',
                    name: 'Earning-Detail',
                    component: () =>
                        import(/* webpackChunkName: "api" */ '@/themeCommon/user/fundDEX/staking/detail.vue'),
                    meta: {
                        title: ''
                    },
                    children: h5Children
                },
                {
                    path: '/indexFunds',
                    name: 'IndexFunds',
                    component: () =>
                        import(/* webpackChunkName: "api" */ '@/themeCommon/user/fundDEX/indexFunds/index.vue'),
                    meta: {
                        title: ''
                    },
                    children: h5Children
                },
                {
                    path: '/indexFunds/detail',
                    name: 'IndexFunds-Detail',
                    component: () =>
                        import(/* webpackChunkName: "api" */ '@/themeCommon/user/fundDEX/indexFunds/detail.vue'),
                    meta: {
                        title: ''
                    },
                    children: h5Children
                }
            ]
        }
        ],
    },
    // {
    //     path: '/:params/setting',
    //     name: 'Setting',
    //     component: {
    //         centerView: () => import(/* webpackChunkName: "Forgot" */ '../views/setting/setting.vue')
    //     },
    //     meta: {
    //         title: 'route.setting',
    //         keepAlive: true,
    //         roles: [],
    //     }
    // },
]

export default routes
