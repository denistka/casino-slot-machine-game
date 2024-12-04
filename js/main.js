import * as PIXI from 'pixi.js';
import '../styles/main.scss';
import { SLOT_CONFIG } from './config.js';
import { Reel } from './Reel.js';
import { SpinButton } from './SpinButton.js';
import { Background } from './Background.js';
import { Loader } from './Loader.js';
import { WinAnimation } from './WinAnimation.js';

class SlotMachine {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            backgroundAlpha: 0
        });
        document.getElementById('game-container').appendChild(this.app.view);
        
        this.loader = new Loader(window.innerWidth, window.innerHeight);
        this.app.stage.addChild(this.loader.container);
        this.preloadAssets();
    }

    async preloadAssets() {
        try {
            const assets = [...Object.entries(SLOT_CONFIG.SYMBOLS)];
            assets.forEach(([name, path]) => PIXI.Assets.add({ alias: name, src: path }));
            
            this.textures = {};
            const loadPromises = assets.map(([name]) => 
                PIXI.Assets.load(name).then(texture => {
                    this.textures[name] = texture;
                    this.loader.updateProgress((Object.keys(this.textures).length) / assets.length);
                })
            );
            
            await Promise.all(loadPromises);
            await this.loader.hide();
            this.initialize();
        } catch (error) {
            console.error('Error preloading assets:', error);
            this.loader.text.text = 'Error loading game. Please refresh.';
            this.loader.text.style.fill = 0xFF0000;
        }
    }

    initialize() {
        this.slots = [];
        this.spinning = false;
        
        this.background = new Background(this.app.screen.width, this.app.screen.height);
        this.app.stage.addChildAt(this.background.container, 0);
        
        this.winAnimation = new WinAnimation(this.app.screen.width, this.app.screen.height);
        this.app.stage.addChild(this.winAnimation.container);
        
        this.createSlots();
        this.createSpinButton();
        this.setupLayout();
    }

    createSlots() {
        const slotSize = Math.min(window.innerWidth / 4, window.innerHeight / 4);
        const padding = slotSize * 0.1;
        const startX = (this.app.screen.width - (slotSize * 3 + padding * 2)) / 2;
        const y = this.app.screen.height / 2 - slotSize / 2;

        for (let i = 0; i < SLOT_CONFIG.REEL_COUNT; i++) {
            const reel = new Reel(this.textures, slotSize, i);
            reel.container.x = startX + (slotSize + padding) * i;
            reel.container.y = y;
            this.slots.push(reel);
            this.app.stage.addChild(reel.container);
        }
    }

    createSpinButton() {
        this.spinButton = new SpinButton(this.app.screen.width, this.app.screen.height);
        this.spinButton.button.on('pointerdown', () => this.spin());
        this.app.stage.addChild(this.spinButton.container);
        this.spinButton.resize(this.app.screen.width, this.app.screen.height);
    }

    setupLayout() {
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
            this.loader?.resize(window.innerWidth, window.innerHeight);
            this.updateLayout();
        });
    }

    updateLayout() {
        this.background.resize(this.app.screen.width, this.app.screen.height);
        this.winAnimation.resize(this.app.screen.width, this.app.screen.height);

        const slotSize = Math.min(window.innerWidth / 4, window.innerHeight / 4);
        const padding = slotSize * 0.1;
        const startX = (this.app.screen.width - (slotSize * 3 + padding * 2)) / 2;
        const y = this.app.screen.height / 2 - slotSize / 2;

        this.slots.forEach((reel, index) => {
            reel.container.x = startX + (slotSize + padding) * index;
            reel.container.y = y;
            reel.resize(slotSize);
        });

        this.spinButton?.resize(this.app.screen.width, this.app.screen.height);
    }

    checkForWin() {
        return this.slots.some(reel => {
            const visibleSymbols = reel.getVisibleSymbols();
            return visibleSymbols.some(sprite => sprite.texture === this.textures.coin);
        });
    }

    async spin() {
        if (this.spinning) return;
        
        this.spinning = true;
        this.spinButton.disable();
        this.winAnimation.stop();

        const slotSize = Math.min(window.innerWidth / 4, window.innerHeight / 4);
        await Promise.all(this.slots.map(reel => reel.spin(slotSize)));
        
        this.spinning = false;
        this.spinButton.enable();
        
        if (this.checkForWin()) {
            this.winAnimation.start();
        }
    }
}

new SlotMachine();
