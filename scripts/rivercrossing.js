/** rivercrossing */
(function () {
    var scr;
    let background = "./img/bekken.png";
    let boys, girls, mom, dad, uncle, dog, sign;
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
        },
        {
            name: "Sign",
            role: "sign",
            img: "./img/sign.png"
        }
    ];

    function setupMouse() {
        document.getElementById("space").addEventListener("mousedown", (e) => {
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
            if (spriteClicked(dcl.vector(e.layerX, e.layerY), getActiveArea(sign), sign.img)) {
                if (onFlake.length > 0) {
                    let s = onFlake.filter(p => canMove(p, true));
                    s.forEach(p => {
                        console.log("moving to other side");
                        move(p, true);
                        console.log(onOtherSide);
                    })
                }
            }
        });
        document.getElementById("space").addEventListener("mouseup", (e) => {
            draw();
        });
    }
    function move(s, toOtherSide) {
        let currentPlace = getCurrentPlace(s);
        let bbox = getActiveArea(s);
        if (currentPlace === "bank") {
            onBank.splice(onBank.indexOf(s), 1);
            let offset = 0;
            if (onFlake.length > 0) {
                let bbox2 = getActiveArea(onFlake[0]);
                offset = bbox2.w;
            }
            s.pos = dcl.vector(301 + offset, 435 - bbox.h + onFlake.length * 20);
            onFlake.push(s);
        }
        if (currentPlace === "otherSide") {
            onOtherSide.splice(onOtherSide.indexOf(s), 1);
            let offset = 0;
            if (onFlake.length > 0) {
                let bbox2 = getActiveArea(onFlake[0]);
                offset = bbox2.w;
            }
            s.pos = dcl.vector(301 + offset, 435 - bbox.h + onFlake.length * 20);
            onFlake.push(s);
        }
        if (currentPlace === "flake" && !toOtherSide) {
            onFlake.splice(onFlake.indexOf(s), 1);
            s.pos = s.bankPos;
            onBank.push(s);
        }
        if (currentPlace === "flake" && toOtherSide) {
            onFlake.splice(onFlake.indexOf(s), 1);
            let spacing = 301;
            onOtherSide.forEach(p => {
                spacing += p.width * spriteScale;
            });
            s.pos = dcl.vector(spacing, 535 - bbox.h / 2 + onOtherSide.length * 20);
            onOtherSide.push(s);
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
    function canMove(s, toOtherSide) {
        let currentPlace = getCurrentPlace(s);
        if (currentPlace === "bank" && onFlake.length < 2) {
            return true;
        }
        if (currentPlace === "otherSide" && onFlake.length < 2) {
            return true;
        }
        if (currentPlace === "flake" && !toOtherSide) {
            
            console.log(getCurrentPlace(s));
            let constrainedOnBank = onBank.filter(b => s.constraint.ifWhoIsPresent.indexOf(b.role) > -1);
            let needsToStayWithOnBank = onBank.filter(b => s.constraint.needsToStayWith.indexOf(b.role) > -1);
            if (constrainedOnBank.length > 0 && needsToStayWithOnBank > 0) {
                console.log(constrainedOnBank, needsToStayWithOnBank);
                return false;
            }
            if(onFlake.length === 1){
                if((["mom", "dad"]).indexOf(s.role) > -1){
                    return true;
                }
            }
            return false;

        }
        if (currentPlace === "flake" && toOtherSide) {
            let needsToStayWithOnOtherSide = onOtherSide.filter(b => s.constraint.needsToStayWith.indexOf(b.role) > -1);
            let constrainedOnOtherSide = onOtherSide.filter(b => s.constraint.ifWhoIsPresent.indexOf(b.role) > -1);
            if (constrainedOnOtherSide.length > 0 && needsToStayWithOnOtherSide.length > 0) {
                console.log(constrainedOnOtherSide, needsToStayWithOnOtherSide);
                return false;
            }
            if (onFlake.length === 1 && (["boy", "girl", "dog", "uncle"]).indexOf(s.role) < 0) {
                return true;
            }
            if (onFlake.length === 2) {
                let idx = onFlake.indexOf(s);
                let odx = onFlake.length - 1 - idx;
                return s.movesWith.indexOf(onFlake[odx].role) > -1;
            }
        }
        return false;
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
        drawSprites([sign]);

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
                if (s.role === "sign") {
                    sign = {
                        pos: dcl.vector(0, 430),
                        width: img.width,
                        height: img.height,
                        img: img,
                        role: "sign",
                        name: s.name
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