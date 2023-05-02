var fs = require('node:fs');
class Tile {
    constructor(piece, position) {
        this.piece = piece;

        this.position = position;
        this.side = Math.floor(this.position / 10);

        this.owner = undefined;
        this.level = 0;

        this.mortaged = false;
    }

    /**
     * @returns {number}
     */
    getRent() {
        return this.piece?.rent?.[this.level] || 0;
    }
}

class TileManager {
    static #tiles = [];

    static initBoard() {
        var listOfTiles = JSON.parse(fs.readFileSync("./tiles.json", "utf-8"));
        listOfTiles.forEach((piece, index) => {
            TileManager.#tiles.push(new Tile(piece, index));
        });
    }

    /**
     * @returns {Tile[]}
     */
    static getTiles() {
        return TileManager.#tiles;
    }

    /**
     * @param {number} position 
     * @returns {Tile}
     */
    static getTile(position) {
        return TileManager.#tiles[position];
    }

    /**
     * @param {number} id 
     * @returns {Tile|undefined}
     */
    static getFromID(id) {
        return TileManager.#tiles.find(x => x.piece.card == id);
    }
}

module.exports = {
    TileManager,
    Tile
}