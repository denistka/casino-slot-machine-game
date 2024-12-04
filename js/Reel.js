import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SLOT_CONFIG } from './config.js';

export class Reel {
    constructor(textures, slotSize, index) {
        this.container = new PIXI.Container();
        this.textures = textures;
        this.slotSize = slotSize;
        this.index = index;
        this.sprites = [];
        
        this.setupReel();
        this.createSymbols();

        if (SLOT_CONFIG.PERFORMANCE.CACHE_SPRITES) {
            this.container.cacheAsBitmap = true;
        }
    }

    setupReel() {
        const shadow = new PIXI.Graphics();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawRoundedRect(2, 2, this.slotSize, this.slotSize, 
            this.slotSize * SLOT_CONFIG.LAYOUT.CORNER_RADIUS);
        shadow.endFill();
        this.container.addChild(shadow);

        const background = new PIXI.Graphics();
        background.beginFill(SLOT_CONFIG.COLORS.BACKGROUND);
        background.drawRoundedRect(0, 0, this.slotSize, this.slotSize, 
            this.slotSize * SLOT_CONFIG.LAYOUT.CORNER_RADIUS);
        background.endFill();
        this.container.addChild(background);
        
        const mask = new PIXI.Graphics();
        mask.beginFill(SLOT_CONFIG.COLORS.MASK);
        mask.drawRoundedRect(0, 0, this.slotSize, this.slotSize, 
            this.slotSize * SLOT_CONFIG.LAYOUT.CORNER_RADIUS);
        mask.endFill();
        this.container.addChild(mask);
        this.container.mask = mask;
        
        this.spritesContainer = new PIXI.Container();
        this.container.addChild(this.spritesContainer);
    }

    createSymbols() {
        const spriteSize = this.slotSize * SLOT_CONFIG.LAYOUT.SYMBOL_SCALE;
        const batchSize = SLOT_CONFIG.PERFORMANCE.BATCH_SIZE;
        
        for (let i = 0; i < SLOT_CONFIG.SYMBOL_COUNT; i += batchSize) {
            const batch = new PIXI.Container();
            
            for (let j = 0; j < batchSize && (i + j) < SLOT_CONFIG.SYMBOL_COUNT; j++) {
                const symbol = SLOT_CONFIG.SYMBOL_ORDER[i + j];
                const sprite = new PIXI.Sprite(this.textures[symbol]);
                
                sprite.width = spriteSize;
                sprite.height = spriteSize;
                sprite.anchor.set(0.5);
                sprite.x = this.slotSize / 2;
                sprite.y = (i + j) * this.slotSize + this.slotSize / 2;
                
                this.sprites.push(sprite);
                batch.addChild(sprite);
            }
            
            this.spritesContainer.addChild(batch);
        }
    }

    updateSymbolPositions() {
        const totalHeight = this.slotSize * this.sprites.length;
        
        for (let i = 0; i < this.sprites.length; i += SLOT_CONFIG.PERFORMANCE.BATCH_SIZE) {
            const endIndex = Math.min(i + SLOT_CONFIG.PERFORMANCE.BATCH_SIZE, this.sprites.length);
            
            for (let j = i; j < endIndex; j++) {
                const sprite = this.sprites[j];
                const globalY = sprite.y + this.spritesContainer.y;
                
                if (globalY > this.slotSize) {
                    sprite.y -= totalHeight;
                } else if (globalY < -this.slotSize * 2) {
                    sprite.y += totalHeight;
                }
            }
        }
    }

    getVisibleSymbols() {
        return this.sprites.filter(sprite => {
            const globalY = sprite.y + this.spritesContainer.y;
            return globalY >= 0 && globalY <= this.slotSize;
        });
    }

    spin() {
        return new Promise((resolve) => {
            const extraSteps = Math.floor(Math.random() * SLOT_CONFIG.SYMBOL_COUNT);
            const totalRotations = SLOT_CONFIG.BASE_ROTATIONS + (extraSteps / SLOT_CONFIG.SYMBOL_COUNT);
            const targetY = this.spritesContainer.y + (this.slotSize * SLOT_CONFIG.SYMBOL_COUNT * totalRotations);
            
            if (SLOT_CONFIG.PERFORMANCE.CACHE_SPRITES) {
                this.container.cacheAsBitmap = false;
            }

            gsap.to(this.spritesContainer, {
                y: targetY,
                duration: SLOT_CONFIG.SPIN_DURATION + this.index * SLOT_CONFIG.REEL_DELAY,
                ease: "power2.inOut",
                onUpdate: () => this.updateSymbolPositions(),
                onComplete: () => {
                    if (SLOT_CONFIG.PERFORMANCE.CACHE_SPRITES) {
                        this.container.cacheAsBitmap = true;
                    }
                    resolve();
                }
            });
        });
    }

    resize(newSize) {
        const prevSize = this.slotSize;
        const prevY = this.spritesContainer.y;
        this.slotSize = newSize;

        const spriteSize = newSize * SLOT_CONFIG.LAYOUT.SYMBOL_SCALE;
        const cornerRadius = newSize * SLOT_CONFIG.LAYOUT.CORNER_RADIUS;
        

        const wasCached = this.container.cacheAsBitmap;
        if (wasCached) {
            this.container.cacheAsBitmap = false;
        }

        const shadow = this.container.children[0];
        shadow.clear();
        shadow.beginFill(0x000000, 0.2);
        shadow.drawRoundedRect(2, 2, newSize, newSize, cornerRadius);
        shadow.endFill();

        const background = this.container.children[1];
        background.clear();
        background.beginFill(SLOT_CONFIG.COLORS.BACKGROUND);
        background.drawRoundedRect(0, 0, newSize, newSize, cornerRadius);
        background.endFill();

        
        const mask = this.container.children[2];
        mask.clear();
        mask.beginFill(SLOT_CONFIG.COLORS.MASK);
        mask.drawRoundedRect(0, 0, newSize, newSize, cornerRadius);
        mask.endFill();

        
        if (prevSize) {
            const scale = newSize / prevSize;
            this.spritesContainer.y = prevY * scale;
        }

        
        const totalHeight = newSize * this.sprites.length;
        this.sprites.forEach((sprite, index) => {
            sprite.width = spriteSize;
            sprite.height = spriteSize;
            sprite.x = newSize / 2;

            if (prevSize) {
                const scale = newSize / prevSize;
                sprite.y = (sprite.y - prevSize/2) * scale + newSize/2;
            } else {
                sprite.y = index * newSize + newSize/2;
            }
        });

        if (wasCached) {
            this.container.cacheAsBitmap = true;
        }
        
        this.updateSymbolPositions();
    }
}
