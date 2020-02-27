// 记录数据
async function recordData(data) {
    return request('/v1/game/record', 'POST', data).catch(() => { });
}

// 钻石
async function distributDiamond(data) {
    // @action : 'query'查钻石 || 'collect'发钻石
    // @count 数量（默认60）
    return request('/v1/game/diamond', 'POST', data).catch(() => { });
}

export default {
    // 记录数据
    recordData,
    // 钻石
    distributDiamond,
}