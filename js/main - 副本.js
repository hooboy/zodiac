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
    }
};

var Lottery = {
    elements: {
        tray: $('.tray-image')
    },
    buttons: {
        go: $('#lottery-go')
    },
    initialize: function() {
        this.setup();
    },
    setup: function() {
        var vm = this;

        vm.buttons.go.on('click', function(evt) {
            vm.elements.tray.css({
                'z-index': 0,
                'visibility': 'hidden'
            });

            Zodiac.initialize();

            evt.preventDefault();
        });
    }
};

var Zodiac = {
    animals: null,
    holes: null,
    items: [],
    once: false,
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

        vm.native.container = new createjs.Container();

        createjs.Touch.enable(vm.native.stage);

        // enabled mouse over / out events
        vm.native.stage.enableMouseOver(10);

        // keep tracking the mouse even when it leaves the canvas
        vm.native.stage.mouseMoveOutside = true;

        vm.holes = new createjs.LoadQueue(false);

        vm.holes.addEventListener("complete", vm.holeComplete);

        vm.holes.loadManifest(vm.holeManifest, true, "../images/");

        // vm.getAnimals();
        //
        // vm.lazyImage('images/tray-image-750x652.jpg', function(img) {
        //     var container = new createjs.Container();

        //     var bmp = new createjs.Bitmap(img);

        //     bmp.x = 0;

        //     bmp.y = 0;

        //     bmp.scaleX = settings.sr;

        //     bmp.scaleY = settings.sr;

        //     container.addChild(bmp);

        //     console.info( container );
        //     console.info( img );

        //     vm.native.stage.addChild(container);

        //     vm.native.stage.update();
        // });

        // vm.lazyImage('images/hole-bg.png', function(img) {
        //     var container = new createjs.Container();

        //     var bmp = new createjs.Bitmap(img);

        //     bmp.x = 0;

        //     bmp.y = 0;

        //     bmp.scaleX = settings.sr;

        //     bmp.scaleY = settings.sr;

        //     container.addChild(bmp);

        //     vm.native.stage.addChild(container);

        //     vm.native.stage.update();
        // });
    },
    setup: function() {
        var vm = this;
    },
    lazyImage: function(url, callback) {
        var image = new Image();

        image.onload = function() {
            callback && callback.call(this, image);
        };

        image.src = url;
    },
    setBounds: function() {

    },
    holeComplete: function() {
        var vm = Zodiac,
            holes = vm.holes,
            config = vm.settings,
            stage = vm.native.stage,
            container = vm.native.container,
            coordinates = vm.coordinates,
            holeCoord= vm.holeCoord,
            sr = config.sr,
            ht = config.ht,
            holeCount = 0;

        vm.once = false;

        var ground = new createjs.Bitmap( holes.getResult("ground") );
        ground.setTransform(0, 0, sr, sr);

        container = new createjs.Container();

        vm.getAnimals(function(animals) {
            var list = animals.getItems() || [];

            vm.items = Utils.shuffle( list );

            vm.item

            // console.info( 'vm.items:' );
            // console.info( vm.items );

            var holeWidth = config.hw,
                holeHeight = config.hh,
                items = vm.items,
                lens = items.length,
                i = 0;

            for ( ; i < lens; i++ ) {
                var img = items[i]['result'];

                var animal = items[i]['item'];

                var coordinate = coordinates[i];

                var imgWidth = img.width;

                var imgHeight = img.height;

                var bmp = new createjs.Bitmap( img );

                var x = coordinate.x * sr;

                var y = (coordinate.y + config.hh) * sr;

                // console.info( 'animal:=' );
                // console.info( animal );
                // console.info( 'img:=' );
                // console.info( img );

                bmp.setTransform(x, y, sr, sr);

                bmp.on("click", function() {
                    console.info( 'animal-1:=' );
                    console.info( animal );
                    console.info( 'img-1:=' );
                    console.info( img );

                    // if ( animal.id == 'chicken' ) {
                    //     alert( '小鸡，哪里逃！' );
                    // } else {
                    //     alert("Oops! Fuck!");
                    // }

                    alert( animal.id );
                });

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
                    .to({y: forward}, 1000)
                    .to({y: y}, 1000)
                    .call(function() {
                        if ( !once ) {
                            vm.items = Utils.shuffle( list );

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
        });

        var hole = new createjs.Bitmap( holes.getResult("hole") );
        hole.setTransform(0, 0, sr, sr);


        // var ground = new createjs.Shape();

        // ground.graphics.beginBitmapFill(holes.getResult("ground")).drawRect(0, 0, config.ow, config.oh);

        // ground.scaleX = sr;

        // ground.scaleY = sr;

        // var hole = new createjs.Shape();

        // hole.graphics.beginBitmapFill(holes.getResult("hole")).drawRect(0, 0, config.ow, config.oh);

        stage.addChild( ground, container );

        stage.update();
    },
    tweenComplete: function() {
        var vm = Zodiac;

        vm.holeComplete();

        // if ( !vm.once ) {
        //     vm.holeComplete();

        //     vm.once = true;
        // }
    },
    getAnimals: function(callback) {
        var vm = this;

        // vm.manifest = Utils.shuffle( vm.manifest );

        vm.animals = new createjs.LoadQueue(true);

        vm.animals.addEventListener("complete", function() {
            console.info( 'vm.animals' );
            // console.info( vm.animals.getItems() );

            callback && callback.call(null, vm.animals);
        });

        vm.animals.loadManifest(vm.manifest, true, "../images/");
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

            console.info( bmp );

            stage.update();
        }
    },
    animalComplete: function() {
        var vm = Zodiac,
            animals = vm.animals,
            stage = vm.native.stage,
            container = vm.native.container,
            config = vm.settings;

        // stage.addChild(container);

        var bmp = new createjs.Bitmap( animals.getResult('pig') );

        console.info( 'loader' );
        // console.info( 'loader' );
        // console.info( vm );
        // console.info( animals.getItems() );

        container.addChild(bmp);

        var tween = createjs.Tween.get(container, {loop: true})
            .to({y: -360}, 500, createjs.Ease.bounceOut)
            .to({y: 360}, 500, createjs.Ease.bounceIn);

        // createjs.Ticker.timingMode = createjs.Ticker.RAF;

        createjs.Ticker.addEventListener("tick", vm.tick);

        // stage.update();
    },
    update: function() {

    },
    tick: function() {
        var vm = Zodiac,
            stage = vm.native.stage;

        stage.update();
    }
};