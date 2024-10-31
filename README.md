# arcade-sprite-tilemaps

A MakeCode Arcade extension that allows you to set different tilemaps for different Sprites. When a tilemap is set on a Sprite, the Sprite will only overlap with tiles and collide with walls in that tilemap.

Tilemaps that are set on sprites will NOT be drawn to the screen, they are only used for collisions/overlaps. The only tilemap drawn to the screen is the global tilemap (which you can set using the block from the Scene category). The camera is also tied to the global tilemap, so you'll probably want to make sure that the global tilemap is the same size or bigger than all of the Sprite tilemaps.

Some things you could do with this extension:
* Set different walls for the player and enemy sprites to limit the paths they can take when [path following](https://github.com/jwunderl/arcade-tilemap-a-star)
* Prevent players in a multiplayer game from entering each other's territory
* Create a hidden tilemap for just the player that you use to place tiles that trigger events or cutscenes

It is recommended to also add the [arcade-tile-util](https://github.com/microsoft/arcade-tile-util) extension to your project when using this extension as it has many useful blocks that allow you to check tiles/walls on tilemaps other than the global tilemap.

Note: This extension replaces the physics engine, so it is not compatible with any other extension that overwrites the physics engine.

## Supported targets

* for PXT/arcade
* for PXT/arcade
(The metadata above is needed for package search.)
