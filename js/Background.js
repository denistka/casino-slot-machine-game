import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SLOT_CONFIG } from './config.js';

export class Background {
    constructor(width, height) {
        this.container = new PIXI.Container();
        this.initBackground();
        this.initCircles();
        this.resize(width, height);
        this.startAnimation();
    }

    initBackground() {
        this.background = new PIXI.Graphics();
        this.container.addChild(this.background);
    }

    initCircles() {
        const NUM_CIRCLES = 100;
        const MIN_SIZE = 20;
        const SIZE_RANGE = 80;
        const MIN_OPACITY = 0.01;
        const OPACITY_RANGE = 0.1;
        const MIN_MOVE_RANGE = 30;
        const MOVE_RANGE = 50;
        const MIN_SPEED = 1;
        const SPEED_RANGE = 2;

        this.circles = Array.from({ length: NUM_CIRCLES }, () => {
            const circle = new PIXI.Graphics();
            const colors = SLOT_CONFIG.COLORS.GLOW_COLORS;

            Object.assign(circle, {
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: MIN_OPACITY + Math.random() * OPACITY_RANGE,
                size: MIN_SIZE + Math.random() * SIZE_RANGE,
                relX: Math.random(),
                relY: Math.random(),
                moveRange: MIN_MOVE_RANGE + Math.random() * MOVE_RANGE,
                moveSpeed: MIN_SPEED + Math.random() * SPEED_RANGE,
                moveOffset: Math.random() * Math.PI * 2
            });

            this.container.addChild(circle);
            return circle;
        });
    }

    updateCircle(circle, time) {
        circle.clear();
        circle.beginFill(circle.color);

        const x = circle.relX * this.width;
        const y = circle.relY * this.height;

        const offsetX = Math.sin(time * circle.moveSpeed + circle.moveOffset) * circle.moveRange;
        const offsetY = Math.cos(time * circle.moveSpeed + circle.moveOffset) * circle.moveRange;

        circle.drawCircle(x + offsetX, y + offsetY, circle.size / 2);
        circle.endFill();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        this.background.clear();
        const gradient = new PIXI.Graphics();

        for (let i = 0; i < 15; i++) {
            const ratio = i / 15;
            const color = this.interpolateColor(SLOT_CONFIG.COLORS.BACKGROUND, 0x1a2634, ratio);
            gradient.beginFill(color, 1 - ratio * 0.5);
            gradient.drawRect(0, 0, width, height);
            gradient.endFill();
        }

        this.background.addChild(gradient);

        const time = Date.now() / 1000;
        this.circles.forEach(circle => {
            circle.relX = Math.min(Math.max(circle.relX, 0.1), 0.9);
            circle.relY = Math.min(Math.max(circle.relY, 0.1), 0.9);
            this.updateCircle(circle, time);
        });
    }

    interpolateColor(color1, color2, ratio) {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;

        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return (r << 16) | (g << 8) | b;
    }

    startAnimation() {
        this.circles.forEach(circle => {
            gsap.to(circle, {
                alpha: circle.alpha * 0.1,
                duration: 2 + Math.random() * 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random() * 2
            });
        });

        const updatePositions = () => {
            const time = Date.now() / 10000;
            this.circles.forEach(circle => this.updateCircle(circle, time));
        };

        gsap.ticker.add(updatePositions);
    }
}
