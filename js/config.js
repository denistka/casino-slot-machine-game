export const SLOT_CONFIG = {
    SYMBOL_COUNT: 5,
    REEL_COUNT: 3,
    BASE_ROTATIONS: 3,
    SPIN_DURATION: 2.5,
    REEL_DELAY: 0.5,
    BUTTON_SCALE: 1.1,
    SYMBOLS: {
        cherry: 'assets/cherry.png',
        coin: 'assets/coin.png',
        horseshoe: 'assets/horseshoe.png',
        lemon: 'assets/lemon.png',
        watermelon: 'assets/watermelon.png'
    },
    SYMBOL_ORDER: ['cherry', 'coin', 'horseshoe', 'lemon', 'watermelon'],
    COLORS: {
        BACKGROUND: 0x2c3e50,
        BUTTON: 0xe74c3c,
        BUTTON_HOVER: 0xff6b6b,
        MASK: 0xFFFFFF,
        GLOW_COLORS: [0x3498db, 0xe74c3c, 0xf1c40f, 0xe67e22, 0x1abc9c]
    },
    LAYOUT: {
        REEL_PADDING: 0.1,
        SYMBOL_SCALE: 0.8,
        CORNER_RADIUS: 0.1
    },
    PERFORMANCE: {
        BATCH_SIZE: 5,
        CACHE_SPRITES: true,
        USE_BITMAP_TEXT: true
    }
};
