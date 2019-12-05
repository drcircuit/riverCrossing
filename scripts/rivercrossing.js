/** rivercrossing */
(function () {
    var scr;
    let background = "./img/bekken.png";
    let boys, girls, mom, dad, uncle, dog;
    let spriteScale = 0.07;
    let baseLine = 400;
    boys = [];
    girls = [];
    let onFlake = [];
    let onOtherSide = [];
    let onBank = [];
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
        }
    ];

    function setupMouse() {
        document.getElementById("space").addEventListener("mousedown", (e) => {
            console.log(e);
            let hit = false;
            onOtherSide.forEach(s => {
                let a = getActiveArea(s);
                if (spriteClicked(dcl.vector(e.layerX, e.layerY), a, s.img) && !hit) {
                    console.log("clicked " + s.name);
                    hit = true;
                    dcl.rect(a.x, a.y, a.w, a.h, TRANS, 2, GREEN.toStyle());
                    if (canMove(s)) {
                        move(s);
                    }
                }
                dcl.circle(e.layerX, e.layerY, 5);
            });
            onFlake.forEach(s => {
                let a = getActiveArea(s);
                if (spriteClicked(dcl.vector(e.layerX, e.layerY), a, s.img) && !hit) {
                    console.log("clicked " + s.name);
                    hit = true;
                    dcl.rect(a.x, a.y, a.w, a.h, TRANS, 2, GREEN.toStyle());
                    if (canMove(s)) {
                        move(s);
                    }
                }
                dcl.circle(e.layerX, e.layerY, 5);
            });
            onBank.forEach(s => {
                let a = getActiveArea(s);
                console.log(s);
                if (spriteClicked(dcl.vector(e.layerX, e.layerY), a, s.img) && !hit) {
                    console.log("clicked " + s.name);
                    hit = true;
                    dcl.rect(a.x, a.y, a.w, a.h, TRANS, 2, GREEN.toStyle());
                    if (canMove(s)) {
                        move(s);
                    }
                }
                dcl.circle(e.layerX, e.layerY, 5);
            });
        });
        document.getElementById("space").addEventListener("mouseup", (e) => {
            draw();
        });
    }
    function move(s) {
        let currentPlace = getCurrentPlace(s);
        let bbox = getActiveArea(s);
        if (currentPlace === "bank") {
            onBank.splice(onBank.indexOf(s), 1);
            let offset = 0;
            if (onFlake.length > 0) {
                let bbox2 = getActiveArea(onFlake[0]);
                offset = bbox2.w;
                console.log(bbox2);
            }
            s.pos = dcl.vector(301 + offset, 435 - bbox.h + onFlake.length * 20);
            onFlake.push(s);
        }
        if (currentPlace === "flake") {
            console.log(currentPlace);
            onFlake.splice(onFlake.indexOf(s), 1);
            s.pos = s.bankPos;
            onBank.push(s);
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
        let currentPlace = getCurrentPlace(s);
        if (currentPlace !== "flake" && onFlake.length < 2) {
            return true;
        }
        if (currentPlace === "flake") {
            return true;
        }
    }

    function isTransparent(x, y, img) {        
        let temp = document.createElement("canvas");
        let ctx = temp.getContext("2d");
        let w = img.width * spriteScale;
        let h = img.height * spriteScale;
        ctx.drawImage(img, 0, 0, w, h);
        let data = ctx.getImageData(x, y, 1, 1);
        return data.data[3] < 255;
    }

    function spriteClicked(pos, bbox, img) {
        let hit = pos.x < bbox.w + bbox.x && pos.x > bbox.x && pos.y < bbox.h + bbox.y && pos.y > bbox.y;
        let transparent = false;
        if (hit) {
            let pixelX = Math.floor(pos.x - bbox.x);
            let pixelY = Math.floor(pos.y - bbox.y);
            transparent = isTransparent(pixelX, pixelY, img);
        }
        return hit && !transparent;
    }

    function draw() {
        dcl.clear();
        drawBg();
        drawSprites(onBank);
        drawSprites(onFlake);
        drawSprites(onOtherSide);

    }
    function drawSprites(sprites) {
        sprites.forEach(s => {
            scr.ctx.drawImage(s.img, s.pos.x, s.pos.y, s.img.width * spriteScale, s.img.height * spriteScale);
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

    function reposition() {
        boys.forEach((b, i) => {
            let offset = 0;
            if (i > 0) {
                offset = boys[i - 1].pos.x + boys[i - 1].img.width * spriteScale;
            }
            b.pos = dcl.vector(offset, baseLine - b.img.height * spriteScale - dcl.randomi(1, 20));
            b.bankPos = b.pos.add(0, 0);
            onBank.push(b);
        });
        dad.pos = dcl.vector(boys[boys.length - 1].pos.x + boys[boys.length - 1].img.width * spriteScale, baseLine - dad.img.height * spriteScale - dcl.randomi(5, 10));
        dad.bankPos = dad.pos.add(0, 0);
        onBank.push(dad);
        mom.pos = dcl.vector(dad.pos.x + dad.img.width * spriteScale, baseLine - mom.img.height * spriteScale - dcl.randomi(30, 35));
        mom.bankPos = mom.pos.add(0, 0);
        onBank.push(mom);
        girls.forEach((g, i) => {
            let offset = 0;
            if (i > 0) {
                offset = girls[i - 1].img.width * spriteScale;
            }
            g.pos = dcl.vector(mom.pos.x + mom.img.width * spriteScale + offset, baseLine - g.img.height * spriteScale - dcl.randomi(30, 40));
            g.bankPos = g.pos.add(0, 0);
            onBank.push(g);
        });
        dog.pos = dcl.vector(10 + girls[girls.length - 1].pos.x + girls[girls.length - 1].img.width * spriteScale, baseLine - dog.img.height * spriteScale - dcl.randomi(30, 40));
        dog.bankPos = dog.pos.add(0, 0);
        onBank.push(dog);
        uncle.pos = dcl.vector(dog.pos.x + dog.img.width * spriteScale, baseLine - uncle.img.height * spriteScale - dcl.randomi(30, 40));
        uncle.bankPos = uncle.pos.add(0, 0);
        onBank.push(uncle);
    }

    function getActiveArea(sprite) {
        return { x: sprite.pos.x, y: sprite.pos.y, w: sprite.img.width * spriteScale, h: sprite.img.height * spriteScale };
    }

    function loadSprites() {
        let toLoad = sprites.length;
        sprites.forEach((s) => {
            let img = new Image();
            img.addEventListener("load", () => {
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
                        name: s.name
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
                        name: s.name
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
                        name: s.name
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
                        name: s.name
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
                        name: s.name
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