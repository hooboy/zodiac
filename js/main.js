(function($, global) {
    var win = global,
        location = win.location;

    var soundAudio = document.createElement('audio');

    soundAudio.id = "sound-audio";

    soundAudio.setAttribute('src', 'images/sound.mp3');

    soundAudio.setAttribute('loop', true);

    var Utils = {
        shuffle: function(items, options) {
            if ( !Array.isArray(items) ) {
                throw new Error('shuffle expect an array as parameter.');
            }

            options = options || {};

            var collection = items,
                len = items.length,
                rng = options.rng || Math.random,
                random,
                temp;

            if ( options.copy === true ) {
                collection = items.slice();
            }

            while ( len ) {
                random = Math.floor(rng() * len);

                len -= 1;

                temp = collection[len];

                collection[len] = collection[random];

                collection[random] = temp;
            }

            return collection;
        },
        query: function(url, key) {

            if( !url || url.indexOf("?") == -1 ) {
                return;
            }

            var query = url.substring(url.indexOf("?") + 1),
                params = {};

            if( !!query ) {
                var i = 0,
                    urls = query.split("&"),
                    len = urls.length;

                for(; i<len; i++ ) {
                    var param = urls[i].split("=");

                    params[param[0]] = decodeURIComponent( param[1] );
                }
            }

            if( !!key ) {
                if( !!params[key] ) {
                    return params[key];
                }
            }

            return params;
        }
    };

    var Lottery = {
        warning: false,
        verify: false,
        subscribe: false,
        binded: false,
        _API: '',
        sound: null,
        started: true,
        overend: false,
        parameter: {},
        params: {
            // openId: null,
            openId: 'ouCbltwItY_iheNPsj0GZnBk3lAs',
            // token: null
            token: '0c5b398bec01aad1759eee0d999b00a1'
        },
        config: {
            URI: 'http://idcwxtest.dafysz.cn/',
            API: 'wechat-web/',
            APPID: 'wx875c67a4fc574d93'
        },
        elements: {
            tray: $('.tray-image')
        },
        buttons: {
            go: $('#lottery-go')
        },
        initialize: function() {
            var vm = this,
                config = vm.config;

            vm._API = vm.config.URI + vm.config.API;

            vm.parameter = Utils.query(location.search) || {};

            if ( !!vm.parameter.code ) {
                sessionStorage.setItem('code', vm.parameter.code);
            }

            vm.getUserInfo(function(json) {
                var statusCode = json.code,
                    statusFlag = json.status,
                    data = json.data || null;

                if ( statusCode == 1 && statusFlag == 'success' ) {
                    if ( typeof data.subscribe != 'undefined' ) {
                        vm.subscribe = !!(parseInt(data.subscribe, 10));
                    }

                    if ( !!data.binded ) {
                        vm.binded = !!(parseInt(data.binded, 10));
                    }

                    if ( !!data.customer ) {
                        var openId = data.customer.openid,
                            token = data.customer.token;

                        vm.params.openId = openId;

                        vm.params.token = token;

                        sessionStorage.setItem('openId', openId);

                        sessionStorage.setItem('token', token);
                    } else {
                        var openId = sessionStorage.getItem('openId'),
                            token = sessionStorage.getItem('token');

                        vm.params.openId = openId;

                        vm.params.token = token;
                    }

                    if ( !!data.config ) {
                        var wxConfig = data.config;

                        wx.config({
                            debug: wxConfig.debug || false,
                            appId: wxConfig.appId,
                            timestamp: wxConfig.timestamp,
                            nonceStr: wxConfig.nonceStr,
                            signature: wxConfig.signature,
                            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'closeWindow']
                        });

                        var zodiac_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+ config.APPID +'&redirect_uri='+ config.URI +'activity/zodiac&response_type=code&scope=snsapi_base&state=1#wechat_redirect';

                        var thumbnail = config.URI +'activity/zodiac/images/poster-750x239.jpg';

                        wx.ready(function(){
                            wx.onMenuShareAppMessage({
                                desc: '抓小鸡，赢红包！',
                                link: zodiac_url,
                                // imgUrl: thumbnail,
                                success: function () {
                                    // console.info( 'success' );
                                },
                                cancel: function () {
                                    // console.info( 'cancel' );
                                }
                            });

                            wx.onMenuShareTimeline({
                                link: zodiac_url,
                                // imgUrl: thumbnail,
                                success: function () {
                                    // console.info( 'success' );
                                },
                                cancel: function () {
                                    // console.info( 'cancel' );
                                }
                            });
                        });
                    }

                    vm.warning = false;
                } else {
                    vm.warning = true;
                }

                vm.validate();

                vm.setup();

                vm.getHistory();

                vm.emit();
            });
        },
        setup: function() {
            var vm = this;

            // if ( vm.verify ) {
                vm.getData(); // mock
            // }

            vm.buttons.go.on('click', function(evt) {
                var $btn = $(this);

                if ( !!vm.verify ) {
                    vm.checkStatus(function(json) {
                        var statusCode = json.code,
                            statusFlag = json.status;

                        if ( statusCode == '-1' && statusFlag != 'success' ) {

                            $('#notify-msg').html( json.message );

                            location.hash = '#modal-notify';
                        } else {
                            soundAudio.setAttribute('preload', "auto");

                            soundAudio.play();

                            $btn.replaceWith( '<a href="javascript:;" class="btn-start">开始游戏</a>' );

                            vm.elements.tray.css({
                                'z-index': 0,
                                'visibility': 'hidden'
                            });

                            Zodiac.initialize();
                        }
                    });
                } else {
                    // mock begin
                    // soundAudio.setAttribute('preload', "auto");

                    // soundAudio.play();

                    // $btn.replaceWith( '<a href="javascript:;" class="btn-start">开始游戏</a>' );

                    // vm.elements.tray.css({
                    //     'z-index': 0,
                    //     'visibility': 'hidden'
                    // });

                    // Zodiac.initialize();
                    // mock end

                    // debug commit
                    vm.validate();
                }

                evt.preventDefault();
            });
        },
        emit: function() {
            var vm = this;

            $('#go-history').on('click', function(evt) {
                location.hash = '#modal-history';

                evt.preventDefault();
            });
        },
        validate: function() {
            var vm = this,
                config = vm.config,
                isSubscribe = vm.subscribe,
                isBinded = vm.binded,
                isWarning = vm.warning,
                started = vm.started,
                overend = vm.overend,
                $msg = $('#notify-msg');

            if ( !started ) {
                vm.verify = false;

                $msg.html('活动还未开始哦~');

                location.hash = '#modal-notify';

                return;
            }

            if ( overend ) {
                vm.verify = false;

                $msg.html('您来晚了，活动已经结束咯~');

                location.hash = '#modal-notify';

                return;
            }

            if ( !!isWarning ) {
                location.hash = '#modal-warn';

                vm.verify = false;

                return;
            }

            if ( !isSubscribe ) {
                $msg.html('不好意思，请您先关注我们的公众号!');

                location.hash = '#modal-notify';

                vm.verify = false;

                return;
            }

            if ( !isBinded ) {
                var loginURL = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.APPID +'&redirect_uri=' + config.URI + 'wechat-web/tokens/getWechatOpenId?callback_redirect=' + location.href + '&response_type=code&scope=snsapi_base&state=#state##wechat_redirect';

                $('#go-bind').attr('href', loginURL);

                location.hash = '#modal-subscribe';

                vm.verify = false;

                return;
            }

            vm.verify = true;

            return vm.verify;
        },
        getData: function() {
            var vm = this,
                API = vm._API,
                params = vm.params;

            var jsonData = {
                openId: params.openId,
                token: params.token
            };

            $.ajax({
                url: API + 'chicken/initInfo',
                type: 'POST',
                data: JSON.stringify(jsonData),
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                timeout: 3000
            }).then(function(json) {
                if ( json.status == 'success' ) {
                    vm.setState(json);
                }
            }).fail(function() {
                location.hash = '#modal-warn';
            });
        },
        getHistory: function() {
            var vm = this,
                API = vm._API,
                params = vm.params;

            var jsonData = {
                openId: params.openId,
                token: params.token
            };

            $.ajax({
                url: API + 'chicken/listChicken',
                type: 'POST',
                data: JSON.stringify(jsonData),
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                timeout: 3000
            }).then(function(json) {
                vm.setPrizes(json);
            }).fail(function() {
                location.hash = '#modal-warn';
            });
        },
        getUserInfo: function(callback) {
            var vm = this,
                config = vm.config,
                data;

            var code = vm.parameter.code || sessionStorage.getItem('code');

            if ( !code ) {
                location.hash = '#modal-warn';
            }

            var currentURL = encodeURIComponent(location.href) || '';

            $.ajax({
                url: config.URI + config.API + 'authen/user/info',
                data: {
                    code: code || '',
                    signurl: currentURL
                },
                timeout: 5000
            }).then(function(json) {
                data = json;
            }).fail(function() {
                location.hash = '#modal-warn';
            }).done(function() {
                callback && callback.call(null, data);
            });
        },
        checkStatus: function(callback) {
            var vm = this,
                API = vm._API,
                params = vm.params;

            var jsonData = {
                openId: params.openId,
                token: params.token
            };

            $.ajax({
                url: API + 'chicken/checkIsChicken',
                type: 'POST',
                data: JSON.stringify(jsonData),
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                timeout: 3000
            }).then(function(json) {
                callback && callback.call(null, json);
            }).fail(function() {
                location.hash = '#modal-warn';
            });
        },
        setState: function(json) {
            var vm = this,
                verify = vm.verify,
                data = json.data,
                now = Date.now(),
                beginTime = +new Date(data.beginTime + ' 00:00:00'),
                endTime = +new Date(data.endTime + ' 23:59:59' ),
                $msg = $('#notify-msg');

            $('#lottery-date').html( data.beginTime + '-' + data.endTime );

            $('#lottery-count').html( data.count );

            if ( beginTime >= now ) {
                vm.started = false;

                $msg.html('活动还未开始哦~');

                location.hash = '#modal-notify';
            }

            if ( endTime < now ) {
                vm.overend = true;

                $msg.html('您来晚了，活动已经结束咯~');

                location.hash = '#modal-notify';
            }
        },
        setPrizes: function(json) {
            var vm = this,
                statusFlag = json.status,
                list = json.data,
                $prize = $('#prize');

            if ( statusFlag == 'success' && ( list.length > 0 ) ) {
                var lens = list.length,
                    i = 0,
                    html = '';

                for( ; i < lens; i++ ) {
                    var createTime = list[i]['createTime'],
                        money = parseFloat(list[i]['money']),
                        inx = i + 1;

                    var now = new Date(createTime);

                    var date = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

                    if ( money > 0 ) {
                        html += '<div class="history-row"><div class="cell">'+ inx +'</div><div class="cell">&yen;'+ money +'</div><div class="cell">'+ date +'</div><div class="cell"><a href="javascript:;" data-money="'+ money +'">领取</a></div></div>';
                    } else {
                        html += '<div class="history-row"><div class="cell">'+ inx +'</div><div class="cell">&yen;'+ money +'</div><div class="cell">'+ date +'</div><div class="cell">领取</div></div>';
                    }
                }

                $prize.html( html );
            }

            $prize.on('click', 'a', function(evt) {
                var $this = $(this);

                var amount = parseFloat( $this.attr('data-money') );

                vm.toRedPack(amount);

                evt.preventDefault();
            });

            $('#go-pickup').on('click', function(evt) {
                var $this = $(this);

                var amount = vm.parameter.amount;

                if ( amount > 0 ) {
                    vm.toRedPack(amount);
                } else {
                    $('#notify-msg').html( '领取红包的金额不能为0~' );

                    location.hash = '#modal-notify';
                }

                evt.preventDefault();
            });
        },
        toRedPack: function(amount, callback) {
            var vm = this,
                API = vm._API,
                params = vm.params;

            var jsonData = {
                openId: params.openId,
                token: params.token,
                money: amount
            };

            $.ajax({
                url: API + 'chicken/receiveHongBao',
                type: 'POST',
                data: JSON.stringify(jsonData),
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                timeout: 3000
            }).then(function(json) {
                if ( json.status == 'success' ) {
                    $('.modal-amount').html( amount );

                    location.hash = '#modal-success';

                    callback && callback.call(null, json);
                } else {
                    $('#notify-msg').html( json.message );

                    location.hash = '#modal-notify';
                }
            }).fail(function() {
                location.hash = '#modal-warn';
            });
        },
        saveData: function(amount) {
            var vm = this,
                API = vm._API,
                params = vm.params;

            var jsonData = {
                openId: params.openId,
                token: params.token,
                money: amount
            };

            $.ajax({
                url: API + 'chicken/addInfo',
                type: 'POST',
                data: JSON.stringify(jsonData),
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                timeout: 3000
            }).then(function(json) {
                if ( json.status == 'success' ) {
                    var outURL = 'timeover.html?amount=' + amount;

                    location.href = outURL;
                } else {
                    var message = json.message;

                    $('#notify-msg').html( message );

                    $('#modal-notify').find('.btn-confirm').on('click', function(evt) {

                        location.reload();

                        evt.preventDefault();
                    });

                    location.hash = '#modal-notify';
                }
            }).fail(function() {
                $('#modal-warn').find('.btn-confirm').on('click', function(evt) {

                    location.reload();

                    evt.preventDefault();
                });

                location.hash = '#modal-warn';
            });
        }
    };

    var Zodiac = {
        animals: null,
        holes: null,
        items: [],
        once: false,
        started: true,
        count: 0,
        amount: 0,
        elements: {
            'canvas': $('#zodiac-stage')
        },
        native: {
            stage: null,
            canvas: null,
            container: null
        },
        holeManifest: [
            {
                src: 'hole.png',
                id: 'ground'
            },
            {
                src: 'hole-mask.png',
                id: 'hole'
            }
        ],
        manifest: [
            {src: 'animal-mouse.png', id: 'mouse'},
            {src: 'animal-cattle.png', id: 'cattle'},
            {src: 'animal-tiger.png', id: 'tiger'},
            {src: 'animal-rabbit.png', id: 'rabbit'},
            {src: 'animal-dragon.png', id: 'dragon'},
            {src: 'animal-snake.png', id: 'snake'},
            {src: 'animal-horse.png', id: 'horse'},
            {src: 'animal-sheep.png', id: 'sheep'},
            {src: 'animal-monkey.png', id: 'monkey'},
            {src: 'animal-chicken.png', id: 'chicken'},
            {src: 'animal-dog.png', id: 'dog'},
            {src: 'animal-pig.png', id: 'pig'}
        ],
        holeCoord: [131, 291, 451, 611],
        coordinates: [
            {
                x: 54,
                y: 102
            },
            {
                x: 288,
                y: 102
            },
            {
                x: 522,
                y: 102
            },
            {
                x: 54,
                y: 262
            },
            {
                x: 288,
                y: 262
            },
            {
                x: 522,
                y: 262
            },
            {
                x: 54,
                y: 422
            },
            {
                x: 288,
                y: 422
            },
            {
                x: 522,
                y: 422
            },
            {
                x: 54,
                y: 582
            },
            {
                x: 288,
                y: 582
            },
            {
                x: 522,
                y: 582
            }
        ],
        matrices: [0.6, 0.01, 0.05, 0.2, 0.02, 0.3, 0.08, 1, 0.02, 0.06],
        settings: {
            cw: Math.min(document.documentElement.clientWidth || document.body.clientWidth, 720),
            dw: 750,
            dh: 742,
            sr: 1,
            hw: 174,
            hh: 58,
            ow: 0,
            oh: 0
        },
        initialize: function() {
            var vm = this,
                settings = vm.settings;

            vm.settings.sr = settings.cw / settings.dw;

            vm.settings.ow = settings.cw;

            vm.settings.oh = settings.dh * settings.sr;

            vm.elements.canvas.attr('width', settings.ow).attr('height', settings.oh);

            vm.native.canvas = vm.elements.canvas[0];

            vm.native.stage = new createjs.Stage(vm.native.canvas);

            // vm.native.container = new createjs.Container();

            createjs.Touch.enable(vm.native.stage);

            // enabled mouse over / out events
            vm.native.stage.enableMouseOver(10);

            // keep tracking the mouse even when it leaves the canvas
            vm.native.stage.mouseMoveOutside = true;

            vm.holes = new createjs.LoadQueue(false);

            vm.holes.addEventListener("complete", vm.holeComplete);

            // vm.holes.loadManifest(vm.holeManifest, true, "../zodiac/images/");
            vm.holes.loadManifest(vm.holeManifest, true, "../images/");


            // vm.native.stage.addEventListener("stagemousedown", function(event) {
            //     console.info( event );
            // });
        },
        setup: function() {
            var vm = this;
        },
        countdown: function() {
            var vm = this,
                count = 20,
                timer = null,
                $countdown = $('#countdown-count');

            var loop = function() {
                var amount = parseFloat( vm.amount ).toFixed(2);

                count--;

                $countdown.html( count + 's' );

                if ( count == 1 ) {
                    clearTimeout( count );

                    timer = null;

                    vm.stop();

                    soundAudio.pause();

                    Lottery.saveData( amount );

                    return;
                }

                timer = setTimeout(function() {
                    loop();
                }, 1000);
            };

            setTimeout(function() {
                loop();
            }, 1000);
        },
        holeComplete: function() {
            var vm = Zodiac,
                holes = vm.holes,
                config = vm.settings,
                stage = vm.native.stage,
                container,
                coordinates = vm.coordinates,
                holeCoord= vm.holeCoord,
                matrices = vm.matrices,
                mlength = matrices.length,
                sr = config.sr,
                ht = config.ht,
                holeCount = 0,
                $amount = $('#real-amount');

            if ( !!vm.started ) {
                vm.countdown();

                vm.started = false;
            }

            vm.once = false;

            var ground = new createjs.Bitmap( holes.getResult("ground") );
            ground.setTransform(0, 0, sr, sr);

            container = new createjs.Container();

            vm.native.container = container;

            vm.getAnimals(function(animals) {
                // console.info( 'animals.getItems()' );
                // console.info( animals.getItems() );

                var list = animals.getItems() || [];

                vm.items = list;

                // console.info( list );
                // console.info( vm.items );

                // console.info( 'vm.items:' );
                // console.info( vm.items );

                var holeWidth = config.hw,
                    holeHeight = config.hh,
                    items = list,
                    lens = items.length,
                    i = 0;

                // console.info( list );

                for ( ; i < lens; i++ ) {
                    var img = items[i]['result'];

                    var animal = items[i]['item'];

                    var coordinate = coordinates[i];

                    var imgWidth = img.width;

                    var imgHeight = img.height;

                    var bmp = new createjs.Bitmap( img );

                    var x = coordinate.x * sr;

                    var y = (coordinate.y + config.hh) * sr;

                    img.id = animal.id;

                    // console.info( 'animal:=' );
                    // console.info( animal );
                    // console.info( 'img:=' );
                    // console.info( img );

                    bmp.setTransform(x, y, sr, sr);

                    // console.info( 'img: start' );
                    // console.info( img );

                    container.addChild( bmp );

                    if ( (i + 1) % 3 == 0 ) {
                        var hole = new createjs.Bitmap( holes.getResult("hole") );

                        var holeY = holeCoord[holeCount] * sr;

                        hole.setTransform(0, holeY, sr, sr);

                        holeCount++;

                        container.addChild( hole );
                    }

                    var distance = (imgHeight - config.hh / 2) * sr;

                    var forward = y - distance;

                    var backward = y + distance;

                    var once = false;

                    var tween = createjs.Tween.get(bmp, {loop: true})
                        .to({y: forward}, 800)
                        .to({y: y}, 800)
                        .call(function() {
                            if ( !once ) {
                                // vm.items = Utils.shuffle( list );

                                vm.holeComplete();
                            }

                            once = true;
                        });
                }

                createjs.Ticker.timingMode = createjs.Ticker.RAF;

                createjs.Ticker.addEventListener("tick", vm.tick);

                // vm.items = list;

                // vm.items = Utils.shuffle( list );
                // vm.setBounds();

                // console.info( animals.getItems() );

                // container.addChild( pig );

                // stage.update();
                $(container).one("click", function(event) {
                    var image = event.target.image;

                    if ( image.id == 'chicken' ) {
                        var count = vm.count;

                        var inx = ( mlength + ( count % mlength ) ) % mlength;

                        var currentAmount = matrices[inx];

                        vm.amount += currentAmount;

                        $amount.html( parseFloat(vm.amount).toFixed(2) + '元' );

                        vm.count++;

                        vm.setAmountAnimation( currentAmount );
                    }
                });
            });

            var hole = new createjs.Bitmap( holes.getResult("hole") );
            hole.setTransform(0, 0, sr, sr);

            stage.addChild( ground, container );

            stage.update();
        },
        getAnimals: function(callback) {
            var vm = this;

            vm.manifest = Utils.shuffle( vm.manifest );

            vm.animals = new createjs.LoadQueue(false);

            vm.animals.addEventListener("complete", function() {
                callback && callback.call(null, vm.animals);
            });

            // vm.animals.loadManifest(vm.manifest, true, "../zodiac/images/");
            vm.animals.loadManifest(vm.manifest, true, "../images/");
        },
        setAmountAnimation: function(amount) {
            var vm = Zodiac,
                animals = vm.animals,
                config = vm.settings,
                coordinate = vm.coordinates,
                stage = vm.native.stage,
                items = animals.getItems() || [],
                sr = config.sr,
                hw = config.hw,
                hh = config.hh,
                i = 0,
                lens = items.length,
                coord;

            for ( ; i < lens; i++ ) {
                var item = items[i];

                if ( item.item.id == 'chicken' ) {
                    coord = coordinate[i];
                }
            }

            var animateText = new createjs.Text("+" + amount, "60px", "#f7ab33");

            var x = (coord.x + hw / 2) * sr,
                y = (coord.y - hh) * sr;

            animateText.set({x: x, y: y});

            animateText.textAlign = "center";

            var tween = createjs.Tween.get(animateText)
                        .to({scaleX: 2, scaleY: 2}, 300)
                        .to({alpha: 0, y: y-40}, 500, createjs.Ease.getPowInOut(2));

            stage.addChild( animateText );
        },
        setBounds: function() {
            var vm = this,
                config = vm.settings,
                stage = vm.native.stage,
                container = vm.native.container,
                sr = config.sr,
                coordinates = vm.coordinates,
                animals = Utils.shuffle( vm.items ),
                lens = animals.length,
                i = 0;

            for ( ; i < lens; i++ ) {
                var img = animals[i]['result'];

                var bmp = new createjs.Bitmap( img );

                container.addChild( bmp );

                stage.update();
            }
        },
        tick: function() {
            var vm = Zodiac,
                stage = vm.native.stage;

            stage.update();
        },
        stop: function() {
            var vm = Zodiac;

            createjs.Tween.removeAllTweens();

            createjs.Ticker.removeEventListener("tick", vm.tick);

            $(vm.native.container).off('click');
        }
    };

    var Gameout = {
        params: null,
        initialize: function() {
            var vm = this;

            vm.params = Utils.query(location.search) || {};

            this.setup();
        },
        setup: function() {
            var vm = this;

            vm.filling();
        },
        filling: function() {
            var vm = this,
                amount = vm.params.amount;

            $('#over-round').html( amount );
        }
    };

    global.Lottery = Lottery;

    global.Gameout = Gameout;

})(jQuery, window || this);
