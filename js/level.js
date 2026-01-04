// Level module - Level configuration and loading
const Level = (function() {
    const { CANVAS_HEIGHT } = Physics.getConstants ? Physics.getConstants() : { CANVAS_HEIGHT: 500 };
    const GROUND_Y = CANVAS_HEIGHT - 50;

    // Configuration du niveau 1
    const levelData = {
        birds: 3,
        pigs: [
            { x: 650, y: GROUND_Y - 22 },
            { x: 780, y: GROUND_Y - 22 }
        ],
        blocks: [
            // Tour gauche
            { x: 600, y: GROUND_Y - 30, width: 20, height: 60, type: 'wood' },
            { x: 700, y: GROUND_Y - 30, width: 20, height: 60, type: 'wood' },
            { x: 650, y: GROUND_Y - 70, width: 120, height: 20, type: 'wood' },

            // Tour droite
            { x: 730, y: GROUND_Y - 30, width: 20, height: 60, type: 'stone' },
            { x: 830, y: GROUND_Y - 30, width: 20, height: 60, type: 'stone' },
            { x: 780, y: GROUND_Y - 70, width: 120, height: 20, type: 'wood' },

            // Bloc supérieur
            { x: 715, y: GROUND_Y - 100, width: 80, height: 20, type: 'wood' },
            { x: 715, y: GROUND_Y - 130, width: 20, height: 40, type: 'wood' }
        ]
    };

    let pigs = [];
    let blocks = [];
    let birdsRemaining = 0;

    function load() {
        pigs = [];
        blocks = [];
        birdsRemaining = levelData.birds;

        // Créer les cochons
        for (const pigData of levelData.pigs) {
            const pig = Entities.createPig(pigData.x, pigData.y);
            Physics.addBody(pig);
            pigs.push(pig);
        }

        // Créer les blocs
        for (const blockData of levelData.blocks) {
            const block = Entities.createBlock(
                blockData.x,
                blockData.y,
                blockData.width,
                blockData.height,
                blockData.type
            );
            Physics.addBody(block);
            blocks.push(block);
        }

        return { pigs, blocks, birdsRemaining };
    }

    function removePig(pig) {
        const index = pigs.indexOf(pig);
        if (index > -1) {
            pigs.splice(index, 1);
            Physics.removeBody(pig);
        }
    }

    function removeBlock(block) {
        const index = blocks.indexOf(block);
        if (index > -1) {
            blocks.splice(index, 1);
            Physics.removeBody(block);
        }
    }

    function useBird() {
        birdsRemaining--;
        return birdsRemaining;
    }

    function getPigs() {
        return pigs;
    }

    function getBlocks() {
        return blocks;
    }

    function getBirdsRemaining() {
        return birdsRemaining;
    }

    function reset() {
        // Supprimer tous les corps existants
        for (const pig of [...pigs]) {
            Physics.removeBody(pig);
        }
        for (const block of [...blocks]) {
            Physics.removeBody(block);
        }

        return load();
    }

    return {
        load,
        removePig,
        removeBlock,
        useBird,
        getPigs,
        getBlocks,
        getBirdsRemaining,
        reset
    };
})();
