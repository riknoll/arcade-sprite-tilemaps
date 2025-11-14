//% block="Sprite TileMaps"
//% color="#73643d"
namespace spriteTileMaps {
    const TILEMAP_EXTENSION_KEY = "$spriteTileMaps_TILEMAP";

    //% blockId=spriteTileMaps_getTileMapForSprite
    //% block="$sprite tilemap"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    export function getTileMapForSprite(sprite: Sprite): tiles.TileMapData {
        const existing: tiles.TileMap = sprite.data[TILEMAP_EXTENSION_KEY];

        if (existing) {
            return existing.data;
        }
        else {
            return game.currentScene().tileMap.data;
        }
    }

    //% blockId=spriteTileMaps_setTileMapForSprite
    //% block="$sprite set tilemap to $tilemap"
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% tilemap.shadow=tiles_tilemap_editor
    export function setTileMapForSprite(sprite: Sprite, tilemap: tiles.TileMapData) {
        const map = new tiles.TileMap();
        map.setData(tilemap);
        map.renderable.destroy();
        sprite.data[TILEMAP_EXTENSION_KEY] = map;
    }
}