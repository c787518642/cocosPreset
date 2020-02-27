import Global from 'Global';
import appService from 'app.service';
import Ald from 'Ald';


function getShareInfo() {
    const path = 'https://cdn.herinapp.com/plant-link/shareImg/';

    const ShareImgs = [
        {
            'text': '考验你手速和眼力的时刻到了！',
            'name': 'share-img-0.png',
        },
        {
            'text': '手速慢的人注定要成为失败者',
            'name': 'share-img-1.png',
        },
        {
            'text': '摊牌了，我就是喜欢玩连连看！',
            'name': 'share-img-2.png',
        },
        {
            'text': '这可能是最萌最有趣的连连看了',
            'name': 'share-img-3.png',
        },
        {
            'text': '玩游戏竟然送我手机！',
            'name': 'share-img-4.png',
        },
        {
            'text': '是时候考验你的耐冻能力了',
            'name': 'share-img-5.png',
        },
        {
            'text': '没有一点观察力很难成功完成任务哦',
            'name': 'share-img-6.png',
        },
        {
            'text': '忍痛曝光这个连连看换礼物你要不要',
            'name': 'share-img-7.png',
        },
        {
            'text': '多玩连连看，能做好红娘',
            'name': 'share-img-8.png',
        },
        {
            'text': '植物对对本相连，千里姻缘一线牵',
            'name': 'share-img-9.png',
        },
        {
            'text': '这个游戏真的是太刺激了！',
            'name': 'share-img-10.png',
        },
        // {
        //     'text': '草地没有羊植物当大王',
        //     'name': 'share-img-11.png',
        // },
        // {
        //     'text': '超过五步就枯萎，不拼手速拼智慧',
        //     'name': 'share-img-12.png',
        // },
        {
            'text': '这个游戏很适合躺着玩',
            'name': 'share-img-13.png',
        },
        // {
        //     'text': '青青草原没有羊，这些植物有点狂',
        //     'name': 'share-img-14.png',
        // },
    ];
    const random = Math.floor(Math.random() * (ShareImgs.length));
    return ({
        title: ShareImgs[random].text,
        imageUrl: path + ShareImgs[random].name,
        query: `openId=${Global.userInfo.openId}`,
    });
}

// 外部调用-主动拉起分享
function share(describeName) {
    try {
        const shareInfo = getShareInfo();
        // 替换成 ald
        wx.aldShareAppMessage(Object.assign({}, shareInfo, {
            'ald_desc': describeName || '默认分享',
        }));
        // wx.shareAppMessage(shareInfo);

        Ald.sendEvent(describeName || '默认分享');
        Ald.sendEvent('总分享次数');

        // 数据库打点
        appService.recordData({
            type: 'share',
            count: 1,
        });

    } catch (error) {
    }
}

// 微信右上角分享菜单
function showShareMenu() {
    try {
        wx.showShareMenu();
        // 替换成 ald
        wx.aldOnShareAppMessage(() => {
            // wx.onShareAppMessage(() => {
            appService.recordData({
                type: 'share',
                count: 1,
            });

            Ald.sendEvent('微信分享菜单');
            Ald.sendEvent('总分享次数');

            const shareInfo = getShareInfo();
            return (
                Object.assign({}, shareInfo, {
                    'ald_desc':  '微信分享菜单',
                })
            );
        });
    } catch (err) { }
}

export default {
    share,
    showShareMenu,
};