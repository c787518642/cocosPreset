module.exports = {

    // --用户信息-- //
    userInfo: {
        // openId:"" //区分大小写
    },
    token: '',


    // 路由参数
    routeParams: {},

    // 音频
    audios: {
        // 音效
        'effectName': { clipUrl: 'audio/effectName', type: 'effect', clip: null },
        // 背景音乐
        'bgm': { clipUrl: 'audio/effectName', type: 'bgm', clip: null },
    },

    // 可配置的常量
    // SP_HEAL_TIME: 2 * 60, //体力回复时间（1点/秒）


    // --UI弹框相关-- //
    UIForms: new Map([
        // ['demoPanel', 'prefab/panel/demoPanel'],
    ]),

    UIFormLucenyType: cc.Enum({
        //完全透明，不能穿透
        Lucency: -1,
        //半透明，不能穿透
        Translucence: -1,
        //低透明度，不能穿透
        ImPenetrable: -1,
        // 比较黑
        Black: -1,
        //可以穿透
        Pentrate: -1,
    }),

    UIFormShowMode: cc.Enum({
        //普通
        Normal: -1,
        //反向切换
        ReverseChange: -1,
        //隐藏其他
        HideOther: -1,
    }),

    UIFormType: cc.Enum({
        //普通窗体
        Normal: -1,
        //固定窗体
        Fixed: -1,
        //弹出窗体
        PopUp: -1,
    }),

    // 标志位:正在打开/关闭弹框
    isDialogOpening: false,
    isDialogClosing: false,
};