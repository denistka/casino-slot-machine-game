import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';

export class SpinButton {
    constructor(width, height) {
        this.container = new PIXI.Container();

        this.glow = new PIXI.Graphics();
        this.container.addChild(this.glow);
        
        this.button = new PIXI.Graphics();
        this.container.addChild(this.button);
        
        this.isSpinning = false;
        this.resize(width, height);
        this.startGlowAnimation();
    }

    resize(width, height) {
        const buttonWidth = Math.min(width * 0.2, 200);
        const buttonHeight = buttonWidth * 0.3;
        const cornerRadius = buttonHeight / 2;
        
        this.container.x = width / 2;
        this.container.y = height * 0.75;
        
        this.glow.clear();
        this.glow.beginFill(0xFF0000, 0.4);
        this.glow.drawRoundedRect(-buttonWidth/2 - 15, -buttonHeight/2 - 15, 
            buttonWidth + 30, buttonHeight + 30, cornerRadius + 15);
        this.glow.endFill();
        this.glow.filters = [new PIXI.BlurFilter(12)];
        this.glow.alpha = 0;

        
        this.button.clear();
        this.button.lineStyle(4, 0xFF8800);
        this.button.beginFill(0xFF8800);
        this.button.drawRoundedRect(-buttonWidth/2, -buttonHeight/2, 
            buttonWidth, buttonHeight, cornerRadius);
        this.button.endFill();

        
        if (this.text) {
            this.text.destroy();
        }
        this.text = new PIXI.Text('SPIN', {
            fontFamily: 'Arial',
            fontSize: buttonHeight * 0.5,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold'
        });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        
        this.button.eventMode = 'static';
        
        
        this.button.on('pointerover', () => {
            if (!this.isSpinning) {
                gsap.to(this.glow, { alpha: 1, duration: 0.2 });
                gsap.to(this.button.scale, { x: 1.05, y: 1.05, duration: 0.2 });
            }
        });
        
        this.button.on('pointerout', () => {
            gsap.to(this.glow, { alpha: 0, duration: 0.3 });
            gsap.to(this.button.scale, { x: 1, y: 1, duration: 0.2 });
        });
    }

    startGlowAnimation() {
        this.glow.alpha = 0;
    }

    enable() {
        this.isSpinning = false;
        this.text.text = 'SPIN';
        this.button.eventMode = 'static';
        this.button.alpha = 1;
        gsap.to(this.button.scale, { x: 1, y: 1, duration: 0.2 });
    }

    disable() {
        this.isSpinning = true;
        this.text.text = 'Spinning...';
        this.button.eventMode = 'none';
        this.button.alpha = 0.7;
        gsap.to(this.glow, { alpha: 0, duration: 0.2 });
        gsap.to(this.button.scale, { x: 0.95, y: 0.95, duration: 0.2 });
    }

    setSpinning(isSpinning) {
        if (isSpinning) {
            this.disable();
        } else {
            this.enable();
        }
    }
}
