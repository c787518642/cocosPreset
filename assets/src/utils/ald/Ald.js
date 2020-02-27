import Global from 'Global';

export function sendEvent(eventName, data = {}) {

    const userInfo = Global.userInfo;

    data.channel = userInfo.channel;
    data.openid = userInfo.openId;

    // 自己的账号不纳入统计
    if (userInfo.openId === 'oGMuW5IvXwA20gIQwM98DpqnNikA') return;

    try {
        wx.aldSendEvent(eventName, data);
    } catch (err) { }
}

export function shareAppMessage(object) {
    wx.aldShareAppMessage(object); //阿拉丁share
}

export function onShareAppMessage(object) {
    wx.aldOnShareAppMessage(() => {
        return object;
    }); //阿拉丁share
}

// ald关卡统计
export function stage(action, object = {}) {
    // action = 'onStart','onRunning','onEnd';

    const userInfo = Global.userInfo;

    object.stageId = Global.currentLevel; //关卡ID,必须是1,2,3 || 1.1,1.2,2.1格式,该字段必传
    object.stageName = `第${Global.currentLevel}关`; //关卡名称,该字段必传
    object.userId = userInfo.openId; //用户ID


    // 自己的账号不纳入统计
    if (userInfo.openId === 'oGMuW5IvXwA20gIQwM98DpqnNikA') return;

    try {
        wx.aldStage[action](object);
    } catch (err) { }

}

export default {
    sendEvent, shareAppMessage, onShareAppMessage, stage,
};