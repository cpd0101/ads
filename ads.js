var init = function () {
    if (!$) {
        window.$ = window.jQuery;
    }
};

var triggerEvent = function (dom, type) {
    // 创建
    var evt = document.createEvent('HTMLEvents');

    // 初始化
    evt.initEvent(type, true, true);

    // 触发
    dom.dispatchEvent(evt);
};

var isNotUrl = function (str) {
    if (!str || str.indexOf('javascript:') == 0) {
        return true;
    }
    return false;
};

var findAds = function (width, height) {
    var $img = $('img,embed,object').filter(function (index, item) {
        return $(item).width() == width && $(item).height() == height;
    });
    
    var $a = $img.siblings('a');
    if ($a.length == 0) {
        $a = $img.parents('a');
    }

    return $a;
};

var openAds = function (href) {
    var $iframe = $('<iframe height=0 width=0 />');
    $('body').append($iframe);
    $iframe.get(0).src = href;
};

var autoOpenAds = function (width, height) {
    var $a = findAds(width, height);

    if ($a.length < 1) {
        return false;
    }

    if (!isNotUrl($a.attr('href'))) {
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

setTimeout(function () {
    if (!autoOpenAds(728, 90)) {
        setTimeout(arguments.callee, 1000);
    }
}, 1000);