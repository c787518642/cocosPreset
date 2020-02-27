// 向子域发消息
function sendMsg(methodName, value) {
    try {
        // 获取子域(开放域)
        const subContext = wx.getOpenDataContext();
        // 发送消息
        subContext.postMessage({ 'custom-msg': true, methodName, value });
    } catch (error) { }
}


// 显示子域
function showSubContext(subContextName, currentNode) {
    if (!currentNode || !subContextName) {
        console.error('参数不对'); return;
    }
    try {
        const subNode = cc.find(`Canvas/${subContextName}`);
        // 显示和挂载先后可能引起bug
        // 应该先显示，再挂载
        subNode.active = true;
        subNode.parent = currentNode;
    } catch (error) {
        console.error(`Canvas下没有名为 ${subContextName} 的子域`);
    }
}

// 重置子域
function resetSubContext(subContextName, currentNode) {
    if (!currentNode || !subContextName) {
        console.error('参数不对'); return;
    }
    try {
        const subNode = cc.find(`${subContextName}`, currentNode);
        subNode.parent = cc.find('Canvas');
        subNode.active = false;

    } catch (error) {
        console.error(`${currentNode} 下没有名为 ${subContextName} 的子域`);
    }
}

export default {
    sendMsg,
    
    showSubContext,
    resetSubContext,
};