var init = function () {
    if (!$) {
        window.$ = window.jQuery;
    }
    $('body').append('<iframe id="ads" height=0 width=0 />');
};

var triggerEvent = function (dom, type) {
    // 创建
    var evt = document.createEvent('HTMLEvents');

    // 初始化
    evt.initEvent(type, true, true);

    // 触发
    dom.dispatchEvent(evt);
};

var isUrl =  function (strUrl) {// 验证url
    var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" // ftp的user@
        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
        + "|" // 允许IP和DOMAIN（域名）
        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
        + "[a-z]{2,6})" // first level domain- .com or .museum
        + "(:[0-9]{1,4})?"; // 端口- :80
    var re = new RegExp(strRegex);
    return re.test(strUrl);
};

var findAds = function (width, height) {
    var $img = $('img,iframe,embed,object').filter(function (index, item) {
        return $(item).width() == width && $(item).height() == height;
    });
    
    var $a = $img.siblings('a');
    if ($a.length == 0) {
        $a = $img.parents('a');
    }

    return $a;
};

var openAds = function (href) {
    var $iframe = $('iframe#ads');
    if ($iframe.length < 1) {
        $('body').append('<iframe id="ads" height=0 width=0 />');
        $iframe = $('iframe#ads');
    }
    $iframe.get(0).src = href;
};

var autoOpenAds = function (width, height) {
    var $a = findAds(width, height);

    if ($a.length < 1) {
        return false;
    }

    if (isUrl($a.attr('href'))) {
        openAds($a.attr('href'));
    } else {
        var wOpen = window.open;
        window.open = openAds;
        triggerEvent($a.get(0), 'click');
        window.open = wOpen;
    }

    if ($a.parent().get(0).tagName == 'BODY') {
        $a.remove();
    } else {
        $a.parent().remove();
    }

    return true;
};

init();

setTimeout(function () {
    if (!autoOpenAds(300, 250)) {
        setTimeout(arguments.callee, 1000);
    }
}, 1000);