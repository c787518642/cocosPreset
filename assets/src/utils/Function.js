// 异步等待方法
async function sleep(time) {
    return new Promise(r => {
        setTimeout(r, time);
    });
}

// 在指定数组中获取指定长度的随机数
function sampleSize([...arr], n = 1) {
    let m = arr.length;
    while (m) {
        const i = Math.floor(Math.random() * m--);
        [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr.slice(0, n);
}

// 格式化时间(分秒) 00:00
function fomatTime(time) {
    if (!time || time < 0) return '';
    if (time < 60) {
        let second = time % 60;
        if (second < 10) second = '0' + second;
        return '00:' + second;
    }
    // 分
    let min = Math.floor(time / 60);
    if (min < 10) min = '0' + min;
    // 秒
    let second = time % 60;
    if (second < 10 && second >= 0) second = '0' + second;

    return `${min}:${second}`;
}


function disableBtn(node) {
    try {
        // 禁用按钮
        node.getComponent(cc.Button).interactable = false;
        // 更改icon材质
        const iconNode = node.getChildByName('icon');
        const mat = cc.Material.getBuiltinMaterial('2d-gray-sprite');
        iconNode.getComponent(cc.Sprite).setMaterial(0, mat);
    } catch (error) {
        console.error(node, '节点下没有名为"icon"的节点');

    }

}
function enableBtn(node) {
    try {
        // 禁用按钮
        node.getComponent(cc.Button).interactable = true;
        // 更改icon材质
        const iconNode = node.getChildByName('icon');
        const mat = cc.Material.getBuiltinMaterial('2d-sprite');
        iconNode.getComponent(cc.Sprite).setMaterial(0, mat);
    } catch (error) {
        console.error(node, '节点下没有名为"icon"的节点');

    }
}


function getViewPortHeight() {
    return cc.find('Canvas').height / 2;
}


// 飘字
function _showTipLabel(tipLabelPrefab, parent, string) {
    const node = cc.instantiate(tipLabelPrefab);
    const position = parent.getPosition();
    node.setPosition(position.x, position.y + 45);

    node.parent = parent.parent;
    // 如果有字
    string && (node.getComponent(cc.Label).string = string || '');
    const action = cc.sequence(
        // 渐隐的同时移动
        cc.spawn(
            cc.sequence(
                cc.fadeTo(0.5, 255),
                cc.fadeOut(.5),
            ),
            cc.moveBy(1, 0, 30),
        ),
        cc.callFunc((node) => {
            node.destroy();
        })
    );
    node.runAction(action);
}

let _lastTime = null;
// 节流(毫秒数)
function throttle(fn, gapTime, params) {
    return function () {
        let _nowTime = + new Date();
        if (_nowTime - _lastTime > gapTime || !_lastTime) {
            fn(...params);
            _lastTime = _nowTime;
        }
    };
}


// 飘字效果
function showTipLabel(...params) {
    // setInterval(throttle(_showTipLabel,1000),10);
    throttle(_showTipLabel, 1000, params)();
}


// 数字快速变换效果
async function runLabel(node, newValue, time = 500) {

    // time毫秒内，将node节点上的Label 变成 newValue值
    try {
        const oldValue = Number(node.getComponent(cc.Label).string);
        const obj = { a: 0 };
        let objNew = { a: Number(newValue) - oldValue };
        cc.tween(obj).to(time / 1000, objNew, {
            progress: (s, e, c, t) => {
                let num = Math.round(e * t);
                node.getComponent(cc.Label).string = oldValue + num;
            },
        }).start();

        await sleep(time);
    } catch (error) { }
}

async function scaleProp(propNode, startPosition, parentNode) {
    return new Promise(r => {
        const action = cc.sequence(
            cc.callFunc(() => {
                propNode.opacity = 0;
            }),
            cc.scaleTo(0.5, 1.3),
            cc.scaleTo(1, 1),
            cc.callFunc((node) => {
                node.destroy();
                propNode.opacity = 255;
                r();
            })
        );
        // 相同位置复制一个道具
        const node = cc.instantiate(propNode);
        node.setPosition(startPosition);
        // 挂载
        node.parent = parentNode;

        // 执行动画
        node.runAction(action);
    });
}

// 生成气泡
async function drawBubble(scoreBubblePrefab, startPosition, endPosition, parentNode) {
    // 随机生成5到8个
    for (let i = 0; i < Math.floor(Math.random() * 3 + 8); i++) {
        // 每个气泡时间间隔
        const randomOffset = Math.floor(Math.random() * 3 + 2);

        //生成气泡节点
        const scoreBubbleNode = cc.instantiate(scoreBubblePrefab);

        // 生成位置偏移量
        const offsetX = (randomOffset * 5 * (Math.random() < 0.5 ? -1 : 1));
        const offsetY = (randomOffset * 5 * (Math.random() < 0.5 ? -1 : 1));

        scoreBubbleNode.setPosition(
            startPosition.x + offsetX,
            startPosition.y + 40 + offsetY
        );
        scoreBubbleNode.parent = parentNode;

        const action = cc.sequence(
            cc.spawn(
                cc.moveTo(.5, endPosition.x + 15, endPosition.y - 10)
                    .easing(cc.easeCubicActionInOut()),
                cc.sequence(
                    cc.fadeTo(0.3, 255),
                    cc.fadeOut(0.15),
                )
            ),
            cc.callFunc((node) => {
                node.destroy();
            })
        );
        scoreBubbleNode.runAction(action);
        // 每个气泡 生成有时间差
        await sleep(randomOffset * 10);
    }
    await sleep(1000);
}


export {
    sleep,
    sampleSize,
    fomatTime,

    disableBtn,
    enableBtn,

    getViewPortHeight,

    // 效果
    showTipLabel,//飘字
    runLabel,//数字快速变换
    scaleProp,// 接受礼物效果，(缩放礼物节点)
    drawBubble,// 气泡效果
};