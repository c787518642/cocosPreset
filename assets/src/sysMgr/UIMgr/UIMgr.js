let Stack = require('Stack');
let Global = require('Global');

let UIFormType = Global.UIFormType;
let UIFormShowMode = Global.UIFormShowMode;
let UIFormLucenyType = Global.UIFormLucenyType;

let UIForms = Global.UIForms;
let UIBase = require('UIBase');

// UIMask管理器
let UIMaskMgr = require('UIMaskMgr');

// 绘制新节点: prefab = 生成节点的预制,parent = 新节点的父节点,position = 新节点位置
function spawnNewNode (prefab,parent,position = cc.v2(0,0)) {
    // 使用预制在场景中生成一个新节点
    let newNode = cc.instantiate(prefab);
    // 将新增节点添加到 Canvas 节点下面
    parent.addChild(newNode);
    // 设置一个随机位置
    newNode.setPosition(position);

    return newNode;
}

cc.Class({
    extends: cc.Component,

    properties: {
        /* 字段 */
        _Instance: null,
        //UI窗体预设路径(参数1：窗体预设名称，2：表示窗体预设路径)
        _MapFormsPaths: Map,
        //缓存所有UI窗体
        _MapALLUIForms: Map,
        //“栈”结构表示的“当前UI窗体”集合。
        _StaCurrentUIForms: Stack,
        //当前显示的UI窗体
        _MapCurrentShowUIForms: Map,
        //UI根节点
        _NodeCanvas: cc.Node,
        //全屏幕显示的节点
        _NodeNormal: cc.Node,
        //固定显示的节点
        _NodeFixed: cc.Node,
        //弹出节点
        _NodePopUp: cc.Node,
        //UI管理脚本的节点
        _NodeUIScripts: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Global.UIMgr = this;
        this.node.addComponent(UIMaskMgr);

        // 字段初始化
        this._MapFormsPaths = new Map(UIForms);
        this._MapALLUIForms = new Map();
        this._StaCurrentUIForms = new Stack();
        this._MapCurrentShowUIForms = new Map();

        // this._NodeCanvas = cc.find('Canvas/UIRoot');
        this._NodeCanvas = cc.find('UIRoot');
        this._NodeNormal = this._NodeCanvas.getChildByName('Normal');
        this._NodeFixed = this._NodeCanvas.getChildByName('Fixed');
        this._NodePopUp = this._NodeCanvas.getChildByName('PopUp');
    },

    start() {

    },

    // update (dt) {},

    // methods

    // 单例(待验证)
    // getInstance() {
    //     if (this._Instance === null) {
    //         this._Instance = new cc.Node('_UIManager').addComponent('UIManager');
    //     }
    //     return this._Instance;
    // },

    // 显示指定UI
    async showUIForm(uiFormName, info) {
        // 弹框打开动画和关闭动画播放时，禁止再开启别的弹框
        if (Global.isDialogOpening || Global.isDialogClosing) return;

        // 标志位:正在打开弹框,在播放完打开动画后，设置为false
        Global.isDialogOpening = true;

        // this._MapALLUIForms.get(uiFormName).show();

        //参数的检查
        if (!uiFormName) return void 0;

        //根据UI窗体的名称，加载到“所有UI窗体”缓存集合中
        let baseUIForm = await this.loadFormToAllUIFormsCatch(uiFormName);

        if (baseUIForm === void 0 || baseUIForm.loading === true) return void 0;

        //判断是否清空“栈”结构体集合
        if (baseUIForm.UIType.IsClearReverseChange) {
            this.clearStackArray();
        }

        //根据不同的UI窗体的显示模式，分别作不同的加载处理
        switch (baseUIForm.UIType.UIFormShowMode) {
            case UIFormShowMode.Normal: //“普通显示”窗口模式
                //把当前窗体加载到“当前窗体”集合中。
                await this.enterUIFormsCache(uiFormName, info);
                break;
            case UIFormShowMode.ReverseChange: //需要“反向切换”窗口模式
                await this.pushUIForms(uiFormName, info);
                break;
            case UIFormShowMode.HideOther: //“隐藏其他”窗口模式
                await this.enterUIFormstToCacheHideOther(uiFormName, info);
                break;
            default:
                break;
        }
    },

    // 关闭或返回上一个UI窗体(关闭当前UI窗体)
    async hideUIForm(uiFormName) {
        if (Global.isDialogOpening || Global.isDialogClosing) return;
        // 标志位:正在关闭弹框,在播放完关闭动画后，设置为false
        Global.isDialogClosing = true;

        //参数的检查
        if (!uiFormName) return void 0;

        //“所有UI窗体缓存”如果没有记录，则直接返回。
        let baseUIForm = this._MapALLUIForms.get(uiFormName);
        if (baseUIForm === void 0) return void 0;

        /* 判断不同的窗体显示模式，分别进行处理 */
        switch (baseUIForm.UIType.UIFormShowMode) {
            case UIFormShowMode.Normal: //“普通显示”窗口模式
                //把当前窗体加载到“当前窗体”集合中。
                await this.exitUIFormsCache(uiFormName);
                break;
            case UIFormShowMode.ReverseChange: //需要“反向切换”窗口模式
                await this.popUIForms();
                break;
            case UIFormShowMode.HideOther: //“隐藏其他”窗口模式
                await this.exitUIFormsFromCacheAndShowOther(uiFormName);
                break;
            default:
                break;
        }
    },

    // 根据UI窗体的名称，加载到“所有UI窗体”缓存集合中
    // 功能： 检查“所有UI窗体”集合中，是否已经加载过，否则才加载。
    async loadFormToAllUIFormsCatch(uiFormName) {

        let baseUIResult = this._MapALLUIForms.get(uiFormName);

        if (baseUIResult === void 0) {
            //加载指定名称的“UI窗体”
            baseUIResult = await this.loadUIForm(uiFormName);
        }

        return baseUIResult;
    },

    // 加载指定名称的“UI窗体”
    // 功能：
    //    1：根据“UI窗体名称”，加载预设克隆体。
    //    2：根据不同预设克隆体中带的脚本中不同的“位置信息”，加载到“根窗体”下不同的节点。
    //    3：隐藏刚创建的UI克隆体。
    //    4：把克隆体，加入到“所有UI窗体”（缓存）集合中。
    async loadUIForm(uiFormName) {
        let strUIFormPaths = this._MapFormsPaths.get(uiFormName); //UI窗体路径
        let uiPrefabs = null; //创建的UI克隆体预设
        let baseUIForm = null; //窗体基类

        this._MapALLUIForms.set(uiFormName, { loading: true }); //UI窗体加载中,避免重复加载

        if (strUIFormPaths !== void 0) {
            uiPrefabs = await Global.ResMgr.loadAssetSync({ url: strUIFormPaths, type: cc.Prefab });
        }

        //设置“UI克隆体”的父节点（根据克隆体中带的脚本中不同的“位置信息”）
        if (this._NodeCanvas !== null && uiPrefabs !== null) {
            let newUINode = spawnNewNode(uiPrefabs, this._NodeCanvas);
            baseUIForm = newUINode.getComponent(UIBase);

            if (baseUIForm === null) {
                cc.error('baseUIForm==null! ,请先确认窗体预设对象上是否加载了baseUIForm的子类脚本！ 参数 uiFormName=' + uiFormName);
                return void 0;
            }

            switch (baseUIForm.UIType.UIFormType) {
                case UIFormType.Normal: //普通窗体节点
                    newUINode.setParent(this._NodeNormal);
                    break;
                case UIFormType.Fixed: //固定窗体节点
                    newUINode.setParent(this._NodeFixed);
                    break;
                case UIFormType.PopUp: //弹出窗体节点
                    newUINode.setParent(this._NodePopUp);
                    break;
                default:
                    break;
            }

            //设置隐藏
            newUINode.active = false;
            //把克隆体，加入到“所有UI窗体”（缓存）集合中。
            this._MapALLUIForms.set(uiFormName, baseUIForm);

            return baseUIForm;
        } else {
            cc.log('_NodeCanvas==null Or uiPrefabs==null!! ,Plese Check!, 参数uiFormName=' + uiFormName);
        }

        this._MapALLUIForms.delete(uiFormName); //加载失败,删除uiFormName = {loading:true}

        cc.log('出现不可以预估的错误，请检查，参数 uiFormName=' + uiFormName);
        return void 0;
    },

    // 加载UI窗体到“当前显示窗体集合”缓存中。
    async enterUIFormsCache(uiFormName, info) {
        let baseUIForm; //UI窗体基类
        let baseUIFormFromAllCache; //从“所有窗体集合”中得到的窗体

        //如果“正在显示”的集合中，存在该UI窗体，则直接返回
        baseUIForm = this._MapCurrentShowUIForms.get(uiFormName);

        if (baseUIForm !== void 0) return;

        //把当前窗体，加载到“正在显示”集合中
        baseUIFormFromAllCache = this._MapALLUIForms.get(uiFormName);

        if (baseUIFormFromAllCache !== void 0) {
            this._MapCurrentShowUIForms.set(uiFormName, baseUIFormFromAllCache);
            await baseUIFormFromAllCache.show(info); //显示当前窗体
        }
    },

    // 卸载UI窗体从“当前显示窗体集合”缓存中
    async exitUIFormsCache(uiFormName) {

        //如果“正在显示”的集合中，存在该UI窗体，则直接返回
        let baseUIForm = this._MapCurrentShowUIForms.get(uiFormName);

        if (baseUIForm === void 0) return void 0;

        await baseUIForm.hide();

        this._MapCurrentShowUIForms.delete(uiFormName);
    },

    // 加载UI窗体到“当前显示窗体集合”缓存中,且隐藏其他正在显示的页面
    async enterUIFormstToCacheHideOther(uiFormName, info) {
        let baseUIForm; //UI窗体基类
        let baseUIFormFromAllCache; //从“所有窗体集合”中得到的窗体

        //如果“正在显示”的集合中，存在该UI窗体，则直接返回
        baseUIForm = this._MapCurrentShowUIForms.get(uiFormName);
        if (baseUIForm !== void 0) return;

        for (let baseUIFormItem of this._MapCurrentShowUIForms.values()) {
            await baseUIFormItem.hide();
        }

        for (let basUIFormItem of this._StaCurrentUIForms.values()) {
            await basUIFormItem.hide();
        }

        //把当前窗体，加载到“正在显示”集合中
        baseUIFormFromAllCache = this._MapALLUIForms.get(uiFormName);

        if (baseUIFormFromAllCache !== void 0) {
            this._MapCurrentShowUIForms.set(uiFormName, baseUIFormFromAllCache);
            await baseUIFormFromAllCache.show(info); //显示当前窗体
        }
    },

    // 卸载UI窗体从“当前显示窗体集合”缓存中,且显示其他原本需要显示的页面
    async exitUIFormsFromCacheAndShowOther(uiFormName) {
        let baseUIForm; //UI窗体基类

        //如果“正在显示”的集合中，存在该UI窗体，则直接返回
        baseUIForm = this._MapCurrentShowUIForms.get(uiFormName);

        if (baseUIForm === void 0) return void 0;

        await baseUIForm.hide();

        this._MapCurrentShowUIForms.delete(uiFormName);

        //“正在显示UI窗体缓存”与“栈缓存”集合里所有窗体进行再次显示处理。
        for (let baseUIFormItem of this._MapCurrentShowUIForms.values()) {
            baseUIFormItem.reShow();
        }

        for (let basUIFormItem of this._StaCurrentUIForms.values()) {
            basUIFormItem.reShow();
        }
    },

    // UI窗体入栈
    // 功能1： 判断栈里是否已经有窗体，有则“冻结”
    //     2： 先判断“UI预设缓存集合”是否有指定的UI窗体,有则处理。
    //     3： 指定UI窗体入"栈"
    async pushUIForms(uiFormName, info) {
        let baseUI; //UI窗体基类

        //判断栈里是否已经有窗体，有则“冻结”
        if (this._StaCurrentUIForms.size > 0) {
            let topUIForm = this._StaCurrentUIForms.peek();
            topUIForm.freeze();
        }

        //先判断“UI预设缓存集合”是否有指定的UI窗体,有则处理。
        baseUI = this._MapALLUIForms.get(uiFormName);

        if (baseUI !== void 0) {
            await baseUI.show(info);
        } else {
            cc.error(`/PushUIForms()/ baseUI === null! 核心错误，请检查 uiFormName=${uiFormName}`);
        }

        //指定UI窗体入"栈"
        this._StaCurrentUIForms.push(baseUI);
    },

    // UI窗体出栈逻辑
    async popUIForms() {
        if (this._StaCurrentUIForms.size >= 2) {
            /* 出栈逻辑 */
            let topUIForm = this._StaCurrentUIForms.pop();
            //出栈的窗体，进行隐藏处理
            await topUIForm.hide();
            //出栈窗体的下一个窗体逻辑
            let nextUIForms = this._StaCurrentUIForms.peek();
            //下一个窗体"重新显示"处理
            nextUIForms.reShow();
        } else if (this._StaCurrentUIForms.size === 1) {
            /* 出栈逻辑 */
            let topUIForm = this._StaCurrentUIForms.pop();
            //出栈的窗体，进行"隐藏"处理
            await topUIForm.hide();
        }
    },

    // 清空“栈”结构体集合
    clearStackArray() {
        if (this._StaCurrentUIForms !== null && this._StaCurrentUIForms.size >= 1) {
            this._StaCurrentUIForms.clear();
            return true;
        }
        return false;
    },
});
