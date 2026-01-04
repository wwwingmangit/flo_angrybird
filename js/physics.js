// Physics module - Matter.js configuration
const Physics = (function() {
    const Engine = Matter.Engine;
    const World = Matter.World;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;
    const Events = Matter.Events;

    let engine;
    let world;

    const CANVAS_WIDTH = 900;
    const CANVAS_HEIGHT = 500;
    const GROUND_HEIGHT = 50;
    const WALL_THICKNESS = 50;

    function init() {
        engine = Engine.create();
        world = engine.world;

        // Gravité standard
        engine.world.gravity.y = 1;

        // Créer le sol
        const ground = Bodies.rectangle(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT - GROUND_HEIGHT / 2,
            CANVAS_WIDTH,
            GROUND_HEIGHT,
            {
                isStatic: true,
                label: 'ground',
                render: { fillStyle: '#8B4513' }
            }
        );

        // Murs invisibles (gauche et droite)
        const leftWall = Bodies.rectangle(
            -WALL_THICKNESS / 2,
            CANVAS_HEIGHT / 2,
            WALL_THICKNESS,
            CANVAS_HEIGHT,
            { isStatic: true, label: 'wall' }
        );

        const rightWall = Bodies.rectangle(
            CANVAS_WIDTH + WALL_THICKNESS / 2,
            CANVAS_HEIGHT / 2,
            WALL_THICKNESS,
            CANVAS_HEIGHT,
            { isStatic: true, label: 'wall' }
        );

        World.add(world, [ground, leftWall, rightWall]);

        return { engine, world };
    }

    function update() {
        Engine.update(engine, 1000 / 60);
    }

    function addBody(body) {
        World.add(world, body);
    }

    function removeBody(body) {
        World.remove(world, body);
    }

    function getAllBodies() {
        return Matter.Composite.allBodies(world);
    }

    function onCollision(callback) {
        Events.on(engine, 'collisionStart', callback);
    }

    function getConstants() {
        return { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_HEIGHT };
    }

    return {
        init,
        update,
        addBody,
        removeBody,
        getAllBodies,
        onCollision,
        getConstants,
        get engine() { return engine; },
        get world() { return world; }
    };
})();
