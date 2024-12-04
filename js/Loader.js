import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SLOT_CONFIG } from './config.js';

export class Loader {
    constructor(width, height) {
        this.container = new PIXI.Container();
        this.width = width;
        this.height = height;
        this.startTime = Date.now();
        this.minDisplayTime = 1000;
        
        this.background = new PIXI.Graphics();
        this.updateBackground();
        this.container.addChild(this.background);
        
        this.progressBox = new PIXI.Graphics();
        this.updateProgressBox();
        this.container.addChild(this.progressBox);
        
        this.progressBar = new PIXI.Graphics();
        this.container.addChild(this.progressBar);
        
        this.text = new PIXI.Text('Loading assets...', {
            fontFamily: 'Arial',
            fontSize: Math.max(16, this.width * 0.02),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        this.text.anchor.set(0.5);
        this.updateTextPosition();
        this.container.addChild(this.text);
        
        this.updateProgress(0);
    }
    
    updateBackground() {
        this.background.clear();
        this.background.beginFill(SLOT_CONFIG.COLORS.BACKGROUND);
        this.background.drawRect(0, 0, this.width, this.height);
        this.background.endFill();
    }
    
    updateProgressBox() {
        const boxWidth = Math.min(this.width * 0.3, 300);
        const boxHeight = Math.max(20, this.height * 0.03);
        
        this.progressBox.clear();
        this.progressBox.lineStyle(2, 0xFFFFFF);
        this.progressBox.beginFill(0x000000, 0.3);
        this.progressBox.drawRoundedRect(
            this.width / 2 - boxWidth / 2,
            this.height / 2 - boxHeight / 2,
            boxWidth,
            boxHeight,
            boxHeight / 2
        );
        this.progressBox.endFill();
        
        this.barWidth = boxWidth - 4;
        this.barHeight = boxHeight - 4;
        this.barX = this.width / 2 - this.barWidth / 2;
        this.barY = this.height / 2 - this.barHeight / 2;
    }
    
    updateTextPosition() {
        this.text.position.set(
            this.width / 2,
            this.height / 2 + this.progressBox.height + 20
        );
    }
    
    updateProgress(progress) {
        this.progressBar.clear();
        this.progressBar.beginFill(0xFFFFFF);
        this.progressBar.drawRoundedRect(
            this.barX,
            this.barY,
            this.barWidth * progress,
            this.barHeight,
            this.barHeight / 2
        );
        this.progressBar.endFill();
        
        this.text.text = `Loading... ${Math.floor(progress * 100)}%`;
    }
    
    resize(width, height) {
        if (!this.container || this.container.destroyed) {
            return;
        }
        
        this.width = width;
        this.height = height;
        
        if (this.background && !this.background.destroyed) {
            this.updateBackground();
        }
        
        if (this.progressBox && !this.progressBox.destroyed) {
            this.updateProgressBox();
        }
        
        if (this.text && !this.text.destroyed) {
            this.updateTextPosition();
        }
    }
    
    hide() {
        return new Promise(resolve => {
            const timeElapsed = Date.now() - this.startTime;
            const remainingTime = Math.max(0, this.minDisplayTime - timeElapsed);
            
            setTimeout(() => {
                gsap.to(this.container, {
                    alpha: 0,
                    duration: 0.3,
                    ease: 'power2.out',
                    onComplete: () => {
                        if (this.container.parent) {
                            this.container.parent.removeChild(this.container);
                        }
                        this.destroy();
                        resolve();
                    }
                });
            }, remainingTime);
        });
    }
    
    destroy() {
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        
        if (this.progressBox) {
            this.progressBox.destroy();
            this.progressBox = null;
        }
        
        if (this.progressBar) {
            this.progressBar.destroy();
            this.progressBar = null;
        }
        
        if (this.text) {
            this.text.destroy();
            this.text = null;
        }
        
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}
