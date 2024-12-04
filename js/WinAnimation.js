import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SLOT_CONFIG } from './config.js';

export class WinAnimation {
    constructor(width, height) {
        this.container = new PIXI.Container();
        this.width = width;
        this.height = height;
        this.particles = [];
        this.active = false;
        
        this.createWinText();
    }

    createWinText() {
        this.winText = new PIXI.Text('YOU WIN!', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: ['#f1c40f', '#e67e22'],
            fontWeight: 'bold',
            stroke: '#2c3e50',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
        });
        
        this.winText.anchor.set(0.5);
        this.winText.alpha = 0;
        this.container.addChild(this.winText);
        this.updateWinTextPosition();
    }

    updateWinTextPosition() {
        this.winText.position.set(
            this.width / 2,
            this.height * 0.3
        );
    }

    createParticle() {
        const particle = new PIXI.Graphics();
        const colors = SLOT_CONFIG.COLORS.GLOW_COLORS;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.beginFill(color);
        particle.drawCircle(0, 0, 5);
        particle.endFill();
        
        particle.x = Math.random() * this.width;
        particle.y = this.height + 10;
        particle.alpha = 0.8;
        
        this.container.addChild(particle);
        return particle;
    }

    animateParticle(particle) {
        const duration = 1 + Math.random() * 2;
        const targetY = -100 + Math.random() * -200;
        const targetX = particle.x + (-100 + Math.random() * 200);
        
        gsap.to(particle, {
            x: targetX,
            y: targetY,
            alpha: 0,
            duration: duration,
            ease: "power1.out",
            onComplete: () => {
                this.container.removeChild(particle);
                const index = this.particles.indexOf(particle);
                if (index > -1) {
                    this.particles.splice(index, 1);
                }
            }
        });
    }

    animateWinText() {
        gsap.killTweensOf(this.winText);
        this.winText.alpha = 0;
        this.winText.scale.set(0.5);
        
        gsap.timeline()
            .to(this.winText, {
                alpha: 1,
                scale: 1.5,
                duration: 0.5,
                ease: "back.out(1.7)"
            })
            .to(this.winText.scale, {
                x: 1,
                y: 1,
                duration: 0.3,
                ease: "power2.out"
            });
    }

    start() {
        if (this.active) return;
        this.active = true;
        
        this.animateWinText();
        
        const createParticles = () => {
            if (!this.active) return;
            
            for (let i = 0; i < 3; i++) {
                const particle = this.createParticle();
                this.particles.push(particle);
                this.animateParticle(particle);
            }
            
            gsap.delayedCall(0.1, createParticles);
        };
        
        createParticles();
    }

    stop() {
        this.active = false;
        gsap.to(this.winText, {
            alpha: 0,
            duration: 0.3,
            ease: "power2.in"
        });
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.updateWinTextPosition();
        
        if (this.winText) {
            this.winText.style.fontSize = Math.max(48, Math.min(72, width * 0.1));
        }
    }
}
