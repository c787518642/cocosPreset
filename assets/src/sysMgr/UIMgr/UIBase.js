let Global = require('Global');
let UIType = require('UIType');
let UIFormType = Global.UIFormType;

cc.Class({
    extends: cc.Component,

    ctor: function () {
        this.UIType = new UIType();
    },

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },

    // update (dt) {},

    // 显示状态 200ms
    show(info) {
        return new Promise(r => {
            //设置模态窗体调用(必须是弹出窗体)
            if (this.UIType.UIFormType === UIFormType.PopUp) {
                Global.UIMaskMgr.setMaskWindow(this.node, this.UIType.UIFormLucenyType);
            }

            this.node.opacity = 0;
            this.node.scale = 0.01;
            this.node.active = true;

            this.UIType.PlayAudio && Global.AudioMgr.play('openPanel');

            const promise = new Promise((rr) => {
                // 从小变大 + 淡入
                const action = cc.sequence(
                    cc.callFunc(() => {
                        // 回调
                        this.onShow(info, promise);
                    }, this),
                    cc.spawn(
                        cc.sequence(
                            cc.delayTime(0.05),
                            cc.callFunc(() => {
                                this.node.opacity = 255;
                            }),
                        ),
                        // 开的时候,为了更快的响应速度，应该先快后慢（FadeOut）
                        cc.scaleTo(0.15, 1).easing(cc.easeCubicActionOut()),
                    ),
                    cc.delayTime(0.05),
                    cc.callFunc(() => {
                        Global.isDialogOpening = false;
                        r();
                        rr();
                    })
                );
                this.node.runAction(action);
            });

        });
    },


    // 隐藏状态 200ms
    hide() {
        return new Promise(r => {
            // 从大变小 + 淡出
            const action = cc.sequence(
                cc.callFunc(() => {

                }, this),
                cc.spawn(
                    cc.sequence(
                        cc.delayTime(0.12),
                        cc.callFunc(() => {
                            this.node.opacity = 0;
                        }),
                    ),
                    // 关的时候，应该保证完整界面显示的画面更多，所以要先慢后快（FadeIn）
                    cc.scaleTo(0.15, 0.01).easing(cc.easeCubicActionIn()),
                ),
                cc.delayTime(0.05),
                cc.callFunc(() => {
                    this.node.active = false;

                    Global.isDialogClosing = false;
                    // 回调
                    this.onHide();
                    r();
                }, this)

            );
            this.node.runAction(action);

            //取消模态窗体调用
            if (this.UIType.UIFormType === UIFormType.PopUp) {
                // 还存在已打开的窗口，不关闭遮罩
                if (Global.UIMgr._StaCurrentUIForms.items.length > 0) return;
                Global.UIMaskMgr.cancelMaskWindow();
            }
        });

    },

    // 重新显示状态
    reShow() {
        this.node.active = true;
        //设置模态窗体调用(必须是弹出窗体)
        if (this.UIType.UIFormType === UIFormType.PopUp) {
            Global.UIMaskMgr.setMaskWindow(this.node, this.UIType.UIFormLucenyType);
        }
        this.onReShow();
    },

    // 冻结状态
    freeze() {
        this.node.active = true;
        this.onFreeze();
    },

    onShow() { },

    onHide() { },

    onReShow() { },

    onFreeze() { },
});
