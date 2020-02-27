// 本地缓存

module.exports = {
    // 设置本地缓存
    set(key,data){
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    },

    // 获取本地缓存
    get(key){
        let data = cc.sys.localStorage.getItem(key);
        if (data === '') return null;
        data = JSON.parse(data);
        return data;
    },
};