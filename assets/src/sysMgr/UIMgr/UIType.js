let Global = require('Global');
let UIFormType = Global.UIFormType;
let UIFormShowMode = Global.UIFormShowMode;
let UIFormLucenyType = Global.UIFormLucenyType;

class UIType {
    constructor(){
        //是否需要清空“反向切换”
        this.IsClearReverseChange = false;
        //UI窗体类型
        this.UIFormType = UIFormType.Normal;
        //UI窗体显示类型
        this.UIFormShowMode = UIFormShowMode.Normal;
        //UI窗体透明度类型
        this.UIFormLucenyType = UIFormLucenyType.Lucency;
    }
}

module.exports = UIType;