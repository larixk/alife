(function (Phaser) {
    'use strict';

    var config = {
        'worldSize': {
            width: 800,
            height: 600
        }
    };

    function init () {
        myGame.loader.addImageFile('lion', 'assets/images/lion.png');
        myGame.loader.addImageFile('tree', 'assets/images/tree.png');
        myGame.loader.load();
    }
    function create() {
        myGame.world.setSize(config.worldSize.width, config.worldSize.height);

        you = myGame.createSprite(400, 300, 'car');
        you.setBounds(0, 0, config.worldSize.width - 16, config.worldSize.height - 16);
        myGame.camera.follow(you, Phaser.Camera.STYLE_TOPDOWN_TIGHT);

        createLife();
    }

    function createLife() {
        life = {};
        for (var kingdom in kingdoms) {
            var species = kingdoms[kingdom];
            life[kingdom] = [];
            for (var specie in species) {
                for (var i = 0 ; i < species[specie].startAmount ; i++) {
                    var organism = new species[specie].create();
                    life[kingdom].push(organism);
                }
            }
        }
        myGame.collide();
    }

    function update() {
        for (var kingdom in life) {
            var organisms = life[kingdom];
            for (var organism in organisms) {
                organisms[organism].live();
            }
        }
        you.velocity.x = 0;
        you.velocity.y = 0;
        you.angularVelocity = 0;
        you.angularAcceleration = 0;
        if(myGame.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            you.angularVelocity = -200;
        } else if(myGame.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            you.angularVelocity = 200;
        }
        if(myGame.input.keyboard.isDown(Phaser.Keyboard.UP)) {
            var motion = myGame.motion.velocityFromAngle(you.angle, 300);
            you.velocity.copyFrom(motion);
        }
        myGame.collide();
    }

    var myGame = new Phaser.Game(this, 'game', 800, 600, init, create, update);
    var life;
    var you;

    var kingdoms = {
        'plants': {
            'tree': {
                'startAmount': 100,
                'create': function () {
                    this.sprite = 'tree';
                    this.live = function () {
                    };
                    var sprite = myGame.createSprite(Math.random() * config.worldSize.width, Math.random() * config.worldSize.height, this.sprite);
                    console.log();
                    sprite.setBounds(0, 0, config.worldSize.width - 16, config.worldSize.height - 16);
                    sprite.immovable = true;
                    this.sprite = sprite;
                }
            }
        },
        'animals': {
            'lion': {
                'startAmount': 5,
                'create': function () {
                    this.sprite = 'lion';
                    this.live = function () {
                        this.sprite.velocity.y += (Math.random() - 0.5) * 10;
                        this.sprite.velocity.x += (Math.random() - 0.5) * 10;
                    };
                    this.sprite = myGame.createSprite(Math.random() * config.worldSize.width, Math.random() * config.worldSize.height, this.sprite);
                    this.sprite.vision = {
                        ahead: 100
                    }
                    this.sprite.setBounds(0, 0, config.worldSize.width - 16, config.worldSize.height - 16);
                }
            }
        }
    };
})(Phaser);
