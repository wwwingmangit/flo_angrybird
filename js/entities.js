// Entities module - Bird, Pig, Block creation
const Entities = (function() {
    const Bodies = Matter.Bodies;

    // Résistances par type de bloc
    const BLOCK_TYPES = {
        wood: { resistance: 3, color: '#8B4513' },
        stone: { resistance: 7, color: '#696969' },
        metal: { resistance: 15, color: '#2C3E50' }
    };

    function createBird(x, y) {
        const bird = Bodies.circle(x, y, 20, {
            label: 'bird',
            restitution: 0.4,
            friction: 0.5,
            density: 0.004,
            render: { fillStyle: '#E74C3C' }
        });
        bird.gameType = 'bird';
        return bird;
    }

    function createPig(x, y) {
        const pig = Bodies.circle(x, y, 22, {
            label: 'pig',
            restitution: 0.3,
            friction: 0.8,
            density: 0.002,
            render: { fillStyle: '#27AE60' }
        });
        pig.gameType = 'pig';
        pig.health = 2;
        return pig;
    }

    function createBlock(x, y, width, height, type = 'wood') {
        const blockType = BLOCK_TYPES[type] || BLOCK_TYPES.wood;

        const block = Bodies.rectangle(x, y, width, height, {
            label: 'block',
            restitution: 0.1,
            friction: 0.8,
            density: type === 'metal' ? 0.008 : type === 'stone' ? 0.005 : 0.002,
            render: { fillStyle: blockType.color }
        });

        block.gameType = 'block';
        block.blockType = type;
        block.resistance = blockType.resistance;
        block.health = blockType.resistance;

        return block;
    }

    function getBlockColor(type) {
        return BLOCK_TYPES[type]?.color || BLOCK_TYPES.wood.color;
    }

    return {
        createBird,
        createPig,
        createBlock,
        getBlockColor,
        BLOCK_TYPES
    };
})();
