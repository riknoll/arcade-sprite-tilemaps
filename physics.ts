namespace spriteTileMaps {
    let init = false;

    export function initPhysics() {
        if (init) return;
        init = true;
        game.addScenePushHandler(() => {
            game.currentScene().physicsEngine = new SpriteTileMapPhysicsEngine();
        })

        const newEngine = new SpriteTileMapPhysicsEngine();
        game.currentScene().physicsEngine = newEngine        
    }
    
    export class SpriteTileMapPhysicsEngine extends ArcadePhysicsEngine {
        constructor(maxVelocity = 500, minSingleStep = 2, maxSingleStep = 4) {
            super(maxVelocity, minSingleStep, maxSingleStep);
        }

        addSprite(sprite: Sprite) {
            this.sprites.push(sprite);
            const tm = getTileMapForSprite(sprite);
            if (tm && tm.isOnWall(sprite)) {
                sprite.flags |= sprites.Flag.IsClipping;
            }
        }

        move(dt: number) {
            // Sprite movement logic is done in milliseconds to avoid rounding errors with Fx8 numbers
            const dtMs = Math.min(MAX_TIME_STEP, dt * 1000);
            const dt2 = Math.idiv(dtMs, 2);

            const scene = game.currentScene();

            const movingSprites = this.sprites
                .map(sprite => this.createMovingSprite(sprite, dtMs, dt2));

            // clear obstacles if moving on that axis
            this.sprites.forEach(s => {
                if (s.vx || s.vy) s.clearObstacles();
            });

            this.map.clear();
            this.map.resizeBuckets(this.sprites);

            const MAX_STEP_COUNT = Fx.toInt(
                Fx.idiv(
                    Fx.imul(
                        Fx.div(
                            this.maxVelocity,
                            this.minSingleStep
                        ),
                        dtMs
                    ),
                    1000
                )
            );
            const overlapHandlers = scene.overlapHandlers.slice();

            // buffers store the moving sprites on each step; switch back and forth between the two
            let selected = 0;
            let buffers = [movingSprites, []];
            for (let count = 0; count < MAX_STEP_COUNT && buffers[selected].length !== 0; ++count) {
                const currMovers = buffers[selected];
                selected ^= 1;
                const remainingMovers = buffers[selected];

                for (let ms of currMovers) {
                    const s = ms.sprite;
                    // if still moving and speed has changed from a collision or overlap;
                    // reverse direction if speed has reversed
                    if (ms.cachedVx !== s._vx) {
                        if (s._vx == Fx.zeroFx8) {
                            ms.dx = Fx.zeroFx8;
                        } else if (s._vx < Fx.zeroFx8 && ms.cachedVx > Fx.zeroFx8
                            || s._vx > Fx.zeroFx8 && ms.cachedVx < Fx.zeroFx8) {
                            ms.dx = Fx.neg(ms.dx);
                            ms.xStep = Fx.neg(ms.xStep);
                        }

                        ms.cachedVx = s._vx;
                    }
                    if (ms.cachedVy !== s._vy) {
                        if (s._vy == Fx.zeroFx8) {
                            ms.dy = Fx.zeroFx8;
                        } else if (s._vy < Fx.zeroFx8 && ms.cachedVy > Fx.zeroFx8
                            || s._vy > Fx.zeroFx8 && ms.cachedVy < Fx.zeroFx8) {
                            ms.dy = Fx.neg(ms.dy);
                            ms.yStep = Fx.neg(ms.yStep);
                        }

                        ms.cachedVy = s._vy;
                    }

                    // identify how much to move in this step
                    const stepX = Fx.abs(ms.xStep) > Fx.abs(ms.dx) ? ms.dx : ms.xStep;
                    const stepY = Fx.abs(ms.yStep) > Fx.abs(ms.dy) ? ms.dy : ms.yStep;
                    ms.dx = Fx.sub(ms.dx, stepX);
                    ms.dy = Fx.sub(ms.dy, stepY);

                    s._lastX = s._x;
                    s._lastY = s._y;
                    s._x = Fx.add(s._x, stepX);
                    s._y = Fx.add(s._y, stepY);

                    if (!(s.flags & SPRITE_NO_SPRITE_OVERLAPS)) {
                        this.map.insertAABB(s);
                    }
                    const tileMap = getTileMapForSprite(s);
                    if (tileMap && tileMap.enabled) {
                        this.tilemapCollisions(ms, tileMap);
                    }

                    // check for screen edge collisions
                    const bounce = s.flags & sprites.Flag.BounceOnWall;
                    if (s.flags & sprites.Flag.StayInScreen || (bounce && !tileMap)) {
                        this.screenEdgeCollisions(ms, bounce, scene.camera);
                    }

                    // if sprite still needs to move, add it to the next step of movements
                    if (Fx.abs(ms.dx) > MIN_MOVE_GAP || Fx.abs(ms.dy) > MIN_MOVE_GAP) {
                        remainingMovers.push(ms);
                    }
                }

                // this step is done; check collisions between sprites
                this.spriteCollisions(currMovers, overlapHandlers);
                // clear moving sprites buffer for next step
                while (currMovers.length) currMovers.pop();
            }
        }


        /** moves a sprite explicitly outside of the normal velocity changes **/
        public moveSprite(s: Sprite, dx: Fx8, dy: Fx8) {
            s._lastX = s._x;
            s._lastY = s._y;
            s._x = Fx.add(s._x, dx);
            s._y = Fx.add(s._y, dy);

            // if the sprite can collide with things, check tile map
            const tm = getTileMapForSprite(s);
            if (tm && tm.enabled) {
                const maxDist = Fx.toInt(this.maxSingleStep);
                // only check tile map if moving within a single step
                if (Math.abs(Fx.toInt(dx)) <= maxDist && Math.abs(Fx.toInt(dy)) <= maxDist) {
                    const ms = new MovingSprite(
                        s,
                        s._vx,
                        s._vy,
                        dx,
                        dy,
                        dx,
                        dy
                    );
                    this.tilemapCollisions(ms, tm);
                    // otherwise, accept movement...
                } else if (tm.isOnWall(s) && !this.canResolveClipping(s, tm)) {
                    // if no luck, flag as clipping into a wall
                    s.flags |= sprites.Flag.IsClipping;
                } else {
                    // or clear clipping if no longer clipping
                    s.flags &= ~sprites.Flag.IsClipping;
                }
            }
        }
    }
}

spriteTileMaps.initPhysics();