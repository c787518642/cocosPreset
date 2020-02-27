import { sleep } from 'Function';


function Input(componentName, propName, nodeName) {
    // if (!componentName) return null;
    return ({
        // 获取输入属性
        get() {
            try {
                const node = nodeName ? cc.find(nodeName) : this.node;
                const component = node.getComponent(componentName);
                if (component[propName] === undefined) throw new Error();
                return component[propName];
            } catch (error) {
                console.error(`${componentName} 中没有定义 ${propName} 属性`);
            }
            return null;
        },
        // 更改输入属性
        set(val) {
            try {
                const node = nodeName ? cc.find(nodeName) : this.node;
                const component = node.getComponent(componentName);
                if (component[propName] === undefined) throw new Error();
                component[propName] = val;
            } catch (error) {
                console.error(`${componentName} 中没有定义 ${propName} 属性`);
            }
        },
        visible: false,
    });
}

function Method(componentName, functionName, nodeName) {
    const func = function (...params) {
        try {
            const node = nodeName ? cc.find(nodeName) : this.node;

            const component = node.getComponent(componentName);
            if (!component[functionName]) throw new Error(`${componentName} 中没有定义 ${functionName} 方法`);
            return component[functionName].apply(component, params);
        } catch (error) {
            console.error(error);
        }
    };
    return func;
}


export default {
    Input,
    Method,
};