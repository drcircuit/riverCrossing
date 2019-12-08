/** rivercrossing */
(function () {
    var scr;
    let background = "./img/bekken.png";
    let boys, girls, mom, dad, uncle, dog, sign, flake, logo, buttons;
    let spriteScale = 0.07;
    let baseLine = 400;
    boys = [];
    girls = [];
    let onFlake = [];
    let onOtherSide = [];
    let onBank = [];
    let started = false;
    let won = false;


    let sprites = [
        {
            name: "Fattern",
            role: "dad",
            img: "./img/nils.png"
        },
        {
            name: "Muttern",
            role: "mom",
            img: "./img/caroline.png"
        },
        {
            name: "Roger",
            role: "boy",
            img: "./img/roger.png"
        },
        {
            name: "Reidar",
            role: "boy",
            img: "./img/reidar.png"
        },
        {
            name: "Randi",
            role: "girl",
            img: "./img/randi.png"
        },
        {
            name: "Ranveig",
            role: "girl",
            img: "./img/ranveig.png"
        },
        {
            name: "Jan",
            role: "uncle",
            img: "./img/jan.png"
        },
        {
            name: "Killer",
            role: "dog",
            img: "./img/dog.png"
        },
        {
            name: "Sign",
            role: "sign",
            img: "./img/sign.png"
        },
        {
            name: "Flake",
            role: "flake",
            img: "./img/flake.png",
            spriteScale: spriteScale
        },
        {
            name: "StartButton",
            role: "button",
            img: "./img/startBtn.png",
            spriteScale: 1
        },
        {
            name: "Title",
            role: "logo",
            img: "./img/logo.png",
            spriteScale: 1
        }
    ];
    function doClick(sprite, vector) {
        if (spriteClicked(vector, sprite)) {
            let a = getActiveArea(sprite, sprite.spriteScale || spriteScale);
            dcl.rect(a.x, a.y, a.w, a.h, TRANS, 2, GREEN.toStyle());
            console.log("clicked " + sprite.name);
            dcl.circle(vector.x, vector.y, 5);
            return true;
        }
        return false;
    }
    function setupMouse() {
        document.getElementById("space").addEventListener("mousedown", (e) => {
            let hit = false;
            let point = dcl.vector(e.layerX, e.layerY);
            if (!started) { 
                buttons.forEach(b=>{
                    if(hit){
                        return;
                    }
                    hit = doClick(b, point);
                });
                if(hit){
                    started = true;
                    return;
                }
            }
            if (started && !won) {
                onOtherSide.concat(onFlake.concat(onBank)).forEach(s => {
                    if (hit) {
                        return;
                    }
                    hit = doClick(s, point);
                    if (hit) {
                        move(s);
                    }
                });
                if (!hit && doClick(flake, point)) {
                    moveFlake();
                    hit = true;
                }
                
            }
        });
        document.getElementById("space").addEventListener("mouseup", (e) => {
            draw();
        });
    }
    function canMoveFlake() {
        let hasAdults = onFlake.filter((s) => (["dad", "mom", "uncle"]).indexOf(s.role) > -1);
        if (hasAdults.length === 0) {
            return false;
        }
        if (flake.location === "bank") {
            let constraints = onFlake.filter((s) => {
                let presentOnBank = onBank.filter((b) => {
                    return s.constraint.ifWhoIsPresent.indexOf(b.role) > -1;
                });
                let constraintByOnBank = onBank.filter((b) => {
                    return s.constraint.needsToStayWith.indexOf(b.role) > -1;
                });
                return presentOnBank.length > 0 && constraintByOnBank.length > 0;
            });

            let a = onBank.filter(s => {

                let ifWho = s.constraint.ifWhoIsPresent.filter(r => {
                    return onBank.filter(sp => sp.role === r).length > 0;
                });
                if (ifWho.length > 0) {
                    let hasToStay = s.constraint.needsToStayWith.filter(r => {
                        return onBank.filter(sp => sp.role === r).length === 0;
                    });
                    return hasToStay.length > 0;
                }
                return false;
            });
            console.log(a);
            constraints = constraints.concat(a);
            return constraints.length === 0;
        }
        if (flake.location === "otherSide") {
            let constraints = onFlake.filter((s) => {
                let presentOnOtherSide = onOtherSide.filter((b) => {
                    return s.constraint.ifWhoIsPresent.indexOf(b.role) > -1;
                });
                let constraintByOnOtherSide = onOtherSide.filter((b) => {
                    return s.constraint.needsToStayWith.indexOf(b.role) > -1;
                });
                return presentOnOtherSide.length > 0 && constraintByOnOtherSide.length > 0;
            });
            console.log(constraints);
            return constraints.length === 0;
        }
    }
    function moveFlake() {
        if (canMoveFlake()) {
            flake.location = flake.location === "bank" ? "otherSide" : "bank";
            flake.spriteScale = flake.location === "bank" ? 0.9 : 1.1;
            flake.pos = flake.location === "bank" ? flake.bankPos : flake.pos.add(10, 10);
            onFlake.forEach(s => {
                s.pos = flake.location === "otherSide" ? s.pos.add(15, 10) : s.pos.sub(15, 10);
                console.log(s.pos);
                s.spriteScale = flake.location === "otherSide" ? s.spriteScale + 0.01 : s.spriteScale - 0.01;
            });
        }
    }
    function move(s) {
        let place = getCurrentPlace(s);
        let bbox = getActiveArea(s);
        if (place === "bank" && flake.location === "bank" && onFlake.length < 2) {
            onBank.splice(onBank.indexOf(s), 1);
            let offset = 0;
            if (onFlake.length > 0) {
                let bbox2 = getActiveArea(onFlake[0]);
                offset = bbox2.w;
            }
            s.pos = dcl.vector(220 + offset, 435 - bbox.h + onFlake.length * 20);
            console.log(bbox.h);
            console.log(s.pos);
            onFlake.push(s);
        }
        if (place === "flake" && flake.location === "bank") {
            onFlake.splice(onFlake.indexOf(s), 1);
            s.pos = s.bankPos;
            onBank.push(s);
        }
        if (place === "flake" && flake.location === "otherSide") {
            onFlake.splice(onFlake.indexOf(s), 1);
            onOtherSide.push(s);
            reposOtherSide();
        }
        if (place === "otherSide" && flake.location === "otherSide") {
            bbox = getActiveArea(s, spriteScale);
            onOtherSide.splice(onOtherSide.indexOf(s), 1);
            let offset = 0;
            if (onFlake.length > 0) {
                let bbox2 = getActiveArea(onFlake[0]);
                offset = bbox2.w;
            }
            s.pos = dcl.vector(220 + offset, 435 - bbox.h + onFlake.length * 20);
            s.pos = s.pos.add(15, 10);
            console.log(bbox.h);
            console.log(s.pos);
            onFlake.push(s);
        }
    }
    function getCurrentPlace(s) {
        if (onBank.indexOf(s) > -1) {
            return "bank";
        }
        if (onFlake.indexOf(s) > -1) {
            return "flake";
        }
        if (onOtherSide.indexOf(s) > -1) {
            return "otherSide";
        }
    }
    function canMove(s) {

        return true;
    }

    function isTransparent(x, y, img, scale) {
        let temp = document.createElement("canvas");
        let ctx = temp.getContext("2d");
        let w = img.width * scale;
        let h = img.height * scale;
        ctx.drawImage(img, 0, 0, w, h);
        let data = ctx.getImageData(x, y, 1, 1);
        return data.data[3] < 255;
    }

    function spriteClicked(pos, sprite) {
        let scale = sprite.spriteScale || spriteScale;
        let bbox = getActiveArea(sprite, scale);
        let img = sprite.img;
        let hit = pos.x < bbox.w + bbox.x && pos.x > bbox.x && pos.y < bbox.h + bbox.y && pos.y > bbox.y;
        let transparent = false;
        if (hit) {
            let pixelX = Math.floor(pos.x - bbox.x);
            let pixelY = Math.floor(pos.y - bbox.y);
            transparent = isTransparent(pixelX, pixelY, img, scale);
        }
        return hit && !transparent;
    }

    function draw() {
        dcl.clear();
        if (won) {
            drawWin();
            return;
        }

        drawBg();
        drawSprites([sign]);

        if (!started) {
            drawTitleScreen();
        } else {
            drawSprites(onBank);
            drawSprites([flake]);
            drawSprites(onFlake);
            drawSprites(onOtherSide);
        }

    }
    function drawTitleScreen() {
        drawSprites([logo]);
        drawSprites(buttons);
    }
    function drawSprites(sprites) {
        sprites.forEach(s => {
            let scale = s.spriteScale || spriteScale;
            scr.ctx.drawImage(s.img, s.pos.x, s.pos.y, s.img.width * scale, s.img.height * scale);
        });
    }
    function drawBg() {
        scr.ctx.drawImage(background, 0, 0);
    }

    function setup() {
        scr = dcl.setupScreen(800, 600);
        scr.setBgColor('black');
        document.body.style.backgroundColor = 'black';
        loadBg();
    }

    function loadBg() {
        let bg = new Image();
        bg.addEventListener("load", function () {
            background = bg;
            loadSprites();
        });
        bg.src = background;
    }
    function reposOtherSide() {
        let offset = 0;
        onOtherSide.forEach((s, i, a) => {

            if (i > 0) {
                let scale = a[i - 1].spriteScale || spriteScale;
                offset = a[i - 1].pos.x + a[i - 1].img.width * scale;
            }
            if (i === 3) {
                offset += 150;
            }
            let scale = s.spriteScale || spriteScale;
            s.pos = dcl.vector(offset, 650 - s.img.height * scale);
        });
    }
    function reposition() {
        boys.forEach((b, i) => {
            let offset = 0;
            if (i > 0) {
                let scale = boys[i - 1].spriteScale || spriteScale
                offset = boys[i - 1].pos.x + boys[i - 1].img.width * scale;
            }
            let scale = b.spriteScale || spriteScale;
            b.pos = dcl.vector(offset, baseLine - b.img.height * scale - dcl.randomi(1, 20));
            b.bankPos = b.pos.add(0, 0);
            onBank.push(b);
        });
        dad.pos = dcl.vector(boys[boys.length - 1].pos.x + boys[boys.length - 1].img.width * (boys[boys.length - 1].spriteScale || spriteScale), baseLine - dad.img.height * (dad.spriteScale || spriteScale) - dcl.randomi(5, 10));
        dad.bankPos = dad.pos.add(0, 0);
        onBank.push(dad);
        mom.pos = dcl.vector(dad.pos.x + dad.img.width * (mom.spriteScale || spriteScale), baseLine - mom.img.height * (mom.spriteScale || spriteScale) - dcl.randomi(30, 35));
        mom.bankPos = mom.pos.add(0, 0);
        onBank.push(mom);
        girls.forEach((g, i) => {
            let offset = 0;
            if (i > 0) {
                let scale = girls[i - 1].spriteScale || spriteScale;
                offset = girls[i - 1].img.width * scale;
            }
            g.pos = dcl.vector(mom.pos.x + mom.img.width * (mom.spriteScale || spriteScale) + offset, baseLine - g.img.height * (g.spriteScale || spriteScale) - dcl.randomi(30, 40));
            g.bankPos = g.pos.add(0, 0);
            onBank.push(g);
        });
        dog.pos = dcl.vector(10 + girls[girls.length - 1].pos.x + girls[girls.length - 1].img.width * (girls[girls.length - 1].spriteScale || spriteScale), baseLine - dog.img.height * (dog.spriteScale || spriteScale) - dcl.randomi(30, 40));
        dog.bankPos = dog.pos.add(0, 0);
        onBank.push(dog);
        uncle.pos = dcl.vector(dog.pos.x + dog.img.width * (dog.spriteScale || spriteScale), baseLine - uncle.img.height * (uncle.spriteScale || spriteScale) - dcl.randomi(30, 40));
        uncle.bankPos = uncle.pos.add(0, 0);
        onBank.push(uncle);
    }

    function getActiveArea(sprite, scale) {
        scale = scale || sprite.spriteScale || spriteScale;
        return { x: sprite.pos.x, y: sprite.pos.y, w: sprite.img.width * scale, h: sprite.img.height * scale };
    }

    function loadSprites() {
        let toLoad = sprites.length;
        sprites.forEach((s) => {
            let img = new Image();
            img.addEventListener("load", () => {
                if (s.role === "logo") {
                    logo = {
                        pos: dcl.vector(400-img.width/2, 10),
                        width: img.width,
                        height: img.height,
                        img: img,
                        role: "logo",
                        spriteScale: 1
                    }
                }
                if (s.role === "button") {
                    let btns = buttons || [];
                    btns.push({
                        pos: dcl.vector(400-(img.width*.3)/2, 300),
                        width: img.width,
                        height: img.height,
                        img: img,
                        role: "button",
                        spriteScale: .3
                    });
                    buttons = btns;
                }
                if (s.role === "flake") {
                    flake = {
                        pos: dcl.vector(220, 400),
                        width: img.width,
                        height: img.height,
                        img: img,
                        role: "flake",
                        name: "Ice Flake",
                        spriteScale: 0.9,
                        location: "bank",
                        bankPos: dcl.vector(220, 400)
                    }
                }
                if (s.role === "sign") {
                    sign = {
                        pos: dcl.vector(0, 430),
                        width: img.width,
                        height: img.height,
                        img: img,
                        role: "sign",
                        name: s.name,
                        spriteScale: spriteScale
                    };
                }
                if (s.role === "dad") {
                    dad = {
                        pos: dcl.vector(0, 0),
                        width: img.width,
                        height: img.height,
                        img: img,
                        movesWith: ["boy", "mom"],
                        constraint: {
                            needsToStayWith: ["boy"],
                            ifWhoIsPresent: ["mom"]
                        },
                        role: "dad",
                        name: s.name,
                        spriteScale: spriteScale
                    }
                }
                if (s.role === "mom") {
                    mom = {
                        pos: dcl.vector(0, 0),
                        width: img.width,
                        height: img.height,
                        img: img,
                        movesWith: ["girl", "dad"],
                        constraint: {
                            needsToStayWith: ["girl"],
                            ifWhoIsPresent: ["dad"]
                        },
                        role: "mom",
                        name: s.name,
                        spriteScale: spriteScale
                    }
                }
                if (s.role === "uncle") {
                    uncle = {
                        pos: dcl.vector(0, 0),
                        width: img.width,
                        height: img.height,
                        img: img,
                        movesWith: ["dog"],
                        constraint: {
                            needsToStayWith: ["dog"],
                            ifWhoIsPresent: ["dad", "mom", "girl", "boy"]
                        },
                        role: "uncle",
                        name: s.name,
                        spriteScale: spriteScale
                    }
                }
                if (s.role === "dog") {
                    dog = {
                        pos: dcl.vector(0, 0),
                        width: img.width,
                        height: img.height,
                        img: img,
                        movesWith: ["uncle"],
                        constraint: {
                            needsToStayWith: ["uncle"],
                            ifWhoIsPresent: ["dad", "mom", "girl", "boy"]
                        },
                        role: "dog",
                        name: s.name,
                        spriteScale: spriteScale
                    }
                }
                if (s.role === "boy") {
                    boys.push({
                        pos: dcl.vector(0, 0),
                        width: img.width,
                        height: img.height,
                        img: img,
                        movesWith: ["dad"],
                        constraint: {
                            needsToStayWith: ["dad"],
                            ifWhoIsPresent: ["mom"]
                        },
                        role: "boy",
                        name: s.name,
                        spriteScale: spriteScale
                    });
                }
                if (s.role === "girl") {
                    girls.push({
                        pos: dcl.vector(0, 0),
                        width: img.width,
                        height: img.height,
                        img: img,
                        movesWith: ["mom"],
                        constraint: {
                            needsToStayWith: ["mom"],
                            ifWhoIsPresent: ["dad"]
                        },
                        role: "girl",
                        name: s.name
                    });
                }
                toLoad--;
                let txt;
                dcl.clear();
                txt = "LOADING. . .  " + (100 - toLoad / sprites.length * 100).toFixed(2) + "% DONE..";
                dcl.text(txt, scr.width / 2, scr.height / 2, CYAN, "ARIAL", 16);
                if (toLoad === 0) {
                    reposition();
                    sprites = boys.concat(girls).concat([mom, dad, uncle, dog]);
                    setupMouse();
                    draw();
                }
            });
            img.src = s.img;
        });
    }
    setup();
})();