(function (undefined) {
    'use strict';

    var $canvas,
        ctx,
        life = [],
        survivors;

    var config = {
        'worldSize': {
            width: 1280,
            height: 600
        }
    };

    function init () {
        createView();
        createLife();
        update();
    }

    function createView() {
        config.worldSize.width = document.querySelector('.container').offsetWidth;
        config.worldSize.height = document.querySelector('.container').offsetHeight;

        $canvas = document.createElement('canvas');
        $canvas.width = config.worldSize.width;
        $canvas.height = config.worldSize.height;

        ctx = $canvas.getContext('2d');

        document.querySelector('.container').appendChild($canvas);
    }

    function createLife() {
        survivors = [];
        var numOrganisms = config.worldSize.width * config.worldSize.height / 1000;
        for (var i = 0; i < numOrganisms; i++) {
            createOrganism();
        }
        life = survivors;
    }

    function rayHit(ray, target, leng) {
        var tVec = {
            x: ray.direction.x * (target.c.x - ray.a.x),
            y: ray.direction.y * (target.c.y - ray.a.y)
        };
        var t = tVec.x + tVec.y,
            lt = Math.sqrt(Math.pow(tVec.x, 2) + Math.pow(tVec.y, 2));

        if (t < 0 || lt > leng) {
            return Number.MAX_VALUE;
        }

        var E = {
            x: t * ray.direction.x + ray.a.x,
            y: t * ray.direction.y + ray.a.y,
        };

        var LEC = Math.sqrt(Math.pow(E.x - target.c.x, 2) + Math.pow(E.y - target.c.y, 2));

        if (LEC <= target.r) {
            return t;
        }
        return Number.MAX_VALUE;
    }
    function createOrganism () {
        var organism = {
            position: {
                x: Math.random() * config.worldSize.width,
                y: Math.random() * config.worldSize.height,
            },
            direction: {
                x: 0,
                y: 0,
            },
            speed: 0,
            acceleration: 0,
            maxSpeed: 20,
            angle: Math.PI * 2 * Math.random(),
            angleDeviation: 0,
            color: '',
            vision: Math.random() * 5 + 2,
            size: Math.random() * 5 + 5,
            hp: 10,
            recalculateAngle: function () {
                this.direction.x = Math.cos(this.angle);
                this.direction.y = Math.sin(this.angle);
            },
            turn: function () {
                this.angleDeviation = Math.min(0.2, Math.max(-0.2, this.angleDeviation));
                this.angle += this.angleDeviation;
                this.recalculateAngle();
            },
            move: function () {
                this.speed += this.acceleration;
                this.speed = Math.max(0, Math.min((this.maxSpeed / this.size), this.speed));

                this.position.x += config.worldSize.width + this.direction.x * this.speed;
                this.position.y += config.worldSize.height + this.direction.y * this.speed;

                this.position.x %= config.worldSize.width;
                this.position.y %= config.worldSize.height;
            },
            turnTowards: function (targetAngle, f) {
                if (Math.abs(targetAngle - this.angle) < Math.PI) {
                    this.angleDeviation += f * (targetAngle - this.angle);
                } else {
                    this.angleDeviation += f * ((targetAngle - Math.PI * 2) - this.angle);
                }
            },
            look: function () {

                var minFollowDistance = Number.MAX_VALUE - 1;
                var closestTarget = false;

                for (var feelerIndex = 0; feelerIndex < 2; feelerIndex++){
                    var visionAngle = Math.PI * -0.5 + feelerIndex * Math.PI + (this.angle + (Math.random() - 0.5) * Math.PI * 1);
                    var visionDirection = {
                        x: Math.cos(visionAngle),
                        y: Math.sin(visionAngle)
                    };
                    var visionEndpoint = {
                        x: this.position.x + visionDirection.x * (this.vision * this.size),
                        y: this.position.y + visionDirection.y * (this.vision * this.size)
                    };
                    for (var i in life) {
                        var target = life[i];
                        if (target === this) {
                            continue;
                        }
                        var followDistance = rayHit({
                                a: this.position,
                                b: visionEndpoint,
                                direction: visionDirection
                            }, {
                                c: target.position,
                                r: target.size
                            }, this.vision * this.size);
                        if (target.size < this.size && followDistance < minFollowDistance) {
                            minFollowDistance = followDistance;
                            this.turnTowards(visionAngle, 0.2);
                            this.acceleration += 1;
                            closestTarget = target;
                        }
                        if (target.size > this.size && followDistance < minFollowDistance) {
                            minFollowDistance = followDistance;
                            this.acceleration += 1;
                            this.turnTowards(visionAngle + Math.PI, 0.8);
                        }
                    }

                    ctx.beginPath();
                    ctx.moveTo(this.position.x, this.position.y);
                    ctx.lineTo(visionEndpoint.x, visionEndpoint.y);
                    ctx.strokeStyle = ('rgba(0,0,0,0.2)');
                    ctx.stroke();
                }

                if (closestTarget && minFollowDistance < this.size) {
                    closestTarget.hp = 0;
                    this.size *= 1.2;
                }
            },
            create: function () {
                this.recalculateAngle();
                var colorScale = Math.random();
                this.color = 'rgba('+(74+Math.floor(colorScale * 121))+','+(60+Math.floor(colorScale * 120))+','+(34+Math.floor(colorScale * 113))+',1)';
            },
            live: function () {
                if (this.hp > 0) {
                    survivors.unshift(this);
                }

                // Meander a bit
                this.angleDeviation *= 0.8;
                this.angleDeviation += (Math.random() - 0.5) * 0.1;

                this.acceleration = -0.02;
                if (Math.random() > 0.99) {
                    this.acceleration = 5;
                }

                this.size *= Math.random() * 0.002 + 0.998;
                this.size += 0.01;

                this.look();

                this.turn();
                this.move();
            },
            draw: function () {
                ctx.fillStyle = (this.color);
                ctx.beginPath();
                ctx.arc(this.position.x, this.position.y, this.size / 2, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.position.x - this.direction.x * this.size * 0.8, this.position.y - this.direction.y * this.size * 0.8, this.size / 2.2, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.position.x - this.direction.x * this.size * 1.4, this.position.y - this.direction.y * this.size * 1.4, this.size / 2.8, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.fill();
            }
        };
        organism.create();
        survivors.push(organism);
    }

    function clearCanvas () {
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(0,0,config.worldSize.width,config.worldSize.height);
    }

    function update() {
        requestAnimationFrame(update);

        clearCanvas();
        survivors = [];
        for (var i in life) {
            var organism = life[i];
            organism.live();
            organism.draw();
        }
        if (Math.random() > 0.99) {
            createOrganism();
        }
        life = survivors;
    }
    init();
})();
