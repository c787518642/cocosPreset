let Global = require('Global');
let UIFormLucenyType = Global.UIFormLucenyType;

cc.Class({
    extends: cc.Component,

    properties: {
        /* 字段 */
        _Instance : null,
        //UI根节点对象
        _NodeCanvasRoot: cc.Node, //
        //UI脚本节点对象
        _NodeUIScripts: cc.Node,
        //顶层面板
        _NodeTopPanel: cc.Node, //
        //遮罩面板
        _NodeMaskPanel: cc.Node, //
        //UI摄像机
        _UICamera: cc.Camera,
        //UI摄像机原始的“层深”
        _OriginalUICameralDepth: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Global.UIMaskMgr = this;

        //得到UI根节点对象、脚本节点对象
        // this._NodeCanvasRoot = cc.find('Canvas/UIRoot');
        this._NodeCanvasRoot = cc.find('UIRoot');


        //得到“顶层面板”、“遮罩面板”
        this._NodeTopPanel = this._NodeCanvasRoot;
        this._NodeMaskPanel = cc.find('PopUp/_UIMaskPanel',this._NodeCanvasRoot);

        //得到UI摄像机原始的“层深”
        this._UICamera = cc.find('UICamera',this._NodeCanvasRoot).getComponent(cc.Camera);

        if (this._UICamera !== null) {
            //得到UI摄像机原始“层深”
            this._OriginalUICameralDepth = this._UICamera.depth;
        } else {
            cc.error('/Start()/UI_Camera is Null!,Please Check!');
        }
    },

    start () {

    },

    // update (dt) {},

    // methods

    // 单例(待验证)
    // getInstance() {
    //     if (this._Instance === null) {
    //         this._Instance = new cc.Node('_UIMaskMgr').addComponent('UIMaskMgr');
    //     }
    //     return this._Instance;
    // },

    setMaskWindow(nodeDisplayUIForm,lucenyType = UIFormLucenyType.Lucency){

        //顶层窗体下移
        this._NodeTopPanel.setSiblingIndex(100);

        //启用遮罩窗体以及设置透明度
        switch (lucenyType) {
            //完全透明，不能穿透
            case UIFormLucenyType.Lucency:
                cc.log('完全透明');
                this._NodeMaskPanel.active = true;
                let newColor1 = new cc.Color(255,255,255);
                this._NodeMaskPanel.color = newColor1;
                this._NodeMaskPanel.opacity = 0;
                break;
                //半透明，不能穿透
            case UIFormLucenyType.Translucence:
                // cc.log('半透明');
                this._NodeMaskPanel.active = true;
                let newColor2 = new cc.Color(220, 220, 220);
                this._NodeMaskPanel.color = newColor2;
                this._NodeMaskPanel.opacity = 50;
                break;
                //低透明，不能穿透
            case UIFormLucenyType.ImPenetrable:
                // cc.log('低透明');
                this._NodeMaskPanel.active = true;
                let newColor3 = new cc.Color(50,50,50);
                this._NodeMaskPanel.color = newColor3;
                this._NodeMaskPanel.opacity = 200;
                break;
            case UIFormLucenyType.Black:
                // cc.log('低透明');
                this._NodeMaskPanel.active = true;
                let newColor4 = new cc.Color(50,50,50);
                this._NodeMaskPanel.color = newColor4;
                this._NodeMaskPanel.opacity = 240;
                break;
                //可以穿透
            case UIFormLucenyType.Pentrate:
                // cc.log('允许穿透');
                if (this._NodeMaskPanel.activeInHierarchy) {
                    this._NodeMaskPanel.active = false;
                }
                break;

            default:
                break;
        }

        //遮罩窗体下移
        this._NodeMaskPanel.setSiblingIndex(100);
        //显示窗体的下移
        nodeDisplayUIForm.setSiblingIndex(100);

        //增加当前UI摄像机的层深（保证当前摄像机为最前显示）
        if (this._UICamera !== null) {
            this._UICamera.depth = this._UICamera.depth + 100; //增加层深
        }
    },

    cancelMaskWindow() {
        //顶层窗体上移
        // this._NodeTopPanel.setSiblingIndex(1);
        //禁用遮罩窗体
        if (this._NodeMaskPanel.activeInHierarchy) {
            //隐藏
            this._NodeMaskPanel.active = false;
        }

        //恢复当前UI摄像机的层深
        if (this._UICamera !== null) {
            this._UICamera.depth = this._OriginalUICameralDepth; //恢复层深
        }
    },
});
