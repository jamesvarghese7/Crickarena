/**
 * Stadium Models Configuration for Three.js
 * Defines 3 stadium sizes with section layouts for procedural 3D generation
 * Enhanced with visual effects configuration
 */

// Seat status colors with glow variants
export const SECTION_COLORS = {
    available: 0x22c55e,    // Green
    availableGlow: 0x4ade80,
    selected: 0x3b82f6,     // Blue
    selectedGlow: 0x60a5fa,
    booked: 0xef4444,       // Red
    bookedGlow: 0xf87171,
    locked: 0x4b5563,       // Gray
    pending: 0xf59e0b,      // Amber
    pendingGlow: 0xfbbf24
};

// Stadium visual themes
export const STADIUM_THEMES = {
    default: {
        name: 'Evening Match',
        grass: 0x228b3d,
        grassHighlight: 0x2d8a4e,
        pitch: 0xd4c4a8,
        structure: 0x334155,
        ambient: 0x404060,
        directional: 0xfff5e6,
        sky: ['#0a0a1a', '#1a1a3a', '#2d1b4e', '#4a2c5a'],
        fog: 0x0a0a1a,
        fogDensity: 0.003
    },
    daylight: {
        name: 'Day Match',
        grass: 0x22c55e,
        grassHighlight: 0x4ade80,
        pitch: 0xf5f5dc,
        structure: 0x64748b,
        ambient: 0xffffff,
        directional: 0xfff7ed,
        sky: ['#87ceeb', '#4a90c2', '#2563eb', '#1d4ed8'],
        fog: 0xe0f2fe,
        fogDensity: 0.001
    },
    night: {
        name: 'Night Match',
        grass: 0x166534,
        grassHighlight: 0x22c55e,
        pitch: 0xc4b896,
        structure: 0x1e293b,
        ambient: 0x1a1a2e,
        directional: 0xffeedd,
        sky: ['#020617', '#0f172a', '#1e293b', '#334155'],
        fog: 0x020617,
        fogDensity: 0.004
    }
};

// Floodlight configuration
export const FLOODLIGHT_CONFIG = {
    small: {
        count: 4,
        height: 50,
        intensity: 1.5,
        color: 0xfff5e0
    },
    medium: {
        count: 4,
        height: 60,
        intensity: 2,
        color: 0xfff5e0
    },
    large: {
        count: 6,
        height: 75,
        intensity: 2.5,
        color: 0xffffee
    }
};

// Animation presets
export const ANIMATION_CONFIG = {
    cameraEntrance: {
        duration: 2500,
        startHeight: 200,
        startDistance: 250,
        endHeight: 80,
        endDistance: 120,
        easing: 'cubicOut'
    },
    seatHover: {
        duration: 150,
        scaleUp: 1.3,
        liftHeight: 0.5,
        easing: 'quadOut'
    },
    seatSelect: {
        popScale: 1.5,
        finalScale: 1.2,
        bounceHeight: 1,
        duration: 250,
        easing: 'elasticOut'
    },
    cameraTransition: {
        duration: 1000,
        easing: 'cubicInOut'
    }
};

/**
 * Stadium model configurations matching backend stadiumGenerator.js
 * Capacities synced with backend values
 */
export const STADIUM_MODELS = {
    small: {
        name: 'Small Stadium',
        code: 'small',
        description: 'Compact stadium ideal for local tournaments',
        totalCapacity: 4500,  // Synced with backend
        sections: [
            { name: 'North Stand', code: 'NS', rows: 10, seatsPerRow: 125, angle: 0, color: '#4ade80', elevation: 0, priceMultiplier: 1.0 },
            { name: 'South Stand', code: 'SS', rows: 10, seatsPerRow: 125, angle: 180, color: '#22d3ee', elevation: 0, priceMultiplier: 1.0 },
            { name: 'East Pavilion', code: 'EP', rows: 10, seatsPerRow: 100, angle: 90, color: '#a78bfa', elevation: 2, priceMultiplier: 1.5 },
            { name: 'West Pavilion', code: 'WP', rows: 10, seatsPerRow: 100, angle: 270, color: '#fb923c', elevation: 2, priceMultiplier: 1.5 },
            { name: 'North-East Corner', code: 'NE', rows: 8, seatsPerRow: 60, angle: 45, color: '#f472b6', elevation: 1, priceMultiplier: 1.2 },
            { name: 'South-East Corner', code: 'SE', rows: 8, seatsPerRow: 60, angle: 135, color: '#facc15', elevation: 1, priceMultiplier: 1.2 },
            { name: 'South-West Corner', code: 'SW', rows: 8, seatsPerRow: 60, angle: 225, color: '#34d399', elevation: 1, priceMultiplier: 1.2 },
            { name: 'North-West Corner', code: 'NW', rows: 8, seatsPerRow: 60, angle: 315, color: '#f87171', elevation: 1, priceMultiplier: 1.2 }
        ],
        dimensions: {
            radius: 60,
            standHeight: 15,
            standDepth: 20,
            roofEnabled: true,
            roofHeight: 25
        },
        floodlights: FLOODLIGHT_CONFIG.small
    },
    medium: {
        name: 'Medium Stadium',
        code: 'medium',
        description: 'Standard stadium for regional tournaments',
        totalCapacity: 13500,  // Synced with backend
        sections: [
            { name: 'North Stand', code: 'NS', rows: 20, seatsPerRow: 200, angle: 0, color: '#4ade80', elevation: 0, priceMultiplier: 1.0 },
            { name: 'South Stand', code: 'SS', rows: 20, seatsPerRow: 200, angle: 180, color: '#22d3ee', elevation: 0, priceMultiplier: 1.0 },
            { name: 'East Pavilion', code: 'EP', rows: 15, seatsPerRow: 150, angle: 90, color: '#a78bfa', elevation: 3, priceMultiplier: 1.5 },
            { name: 'West Pavilion', code: 'WP', rows: 15, seatsPerRow: 150, angle: 270, color: '#fb923c', elevation: 3, priceMultiplier: 1.5 },
            { name: 'North-East Corner', code: 'NE', rows: 10, seatsPerRow: 75, angle: 45, color: '#f472b6', elevation: 1, priceMultiplier: 1.2 },
            { name: 'South-East Corner', code: 'SE', rows: 10, seatsPerRow: 75, angle: 135, color: '#facc15', elevation: 1, priceMultiplier: 1.2 },
            { name: 'South-West Corner', code: 'SW', rows: 10, seatsPerRow: 75, angle: 225, color: '#34d399', elevation: 1, priceMultiplier: 1.2 },
            { name: 'North-West Corner', code: 'NW', rows: 10, seatsPerRow: 75, angle: 315, color: '#f87171', elevation: 1, priceMultiplier: 1.2 },
            { name: 'VIP North', code: 'VN', rows: 5, seatsPerRow: 40, angle: 0, color: '#fcd34d', elevation: 8, priceMultiplier: 2.5 },
            { name: 'VIP South', code: 'VS', rows: 5, seatsPerRow: 40, angle: 180, color: '#fcd34d', elevation: 8, priceMultiplier: 2.5 }
        ],
        dimensions: {
            radius: 80,
            standHeight: 20,
            standDepth: 25,
            roofEnabled: true,
            roofHeight: 35
        },
        floodlights: FLOODLIGHT_CONFIG.medium
    },
    large: {
        name: 'Large Stadium',
        code: 'large',
        description: 'Premium stadium for finals and major matches',
        totalCapacity: 31000,  // Synced with backend
        sections: [
            { name: 'North Stand Lower', code: 'NSL', rows: 25, seatsPerRow: 300, angle: 0, color: '#4ade80', elevation: 0, priceMultiplier: 1.0 },
            { name: 'North Stand Upper', code: 'NSU', rows: 20, seatsPerRow: 300, angle: 0, color: '#86efac', elevation: 12, priceMultiplier: 0.8 },
            { name: 'South Stand Lower', code: 'SSL', rows: 25, seatsPerRow: 300, angle: 180, color: '#22d3ee', elevation: 0, priceMultiplier: 1.0 },
            { name: 'South Stand Upper', code: 'SSU', rows: 20, seatsPerRow: 300, angle: 180, color: '#67e8f9', elevation: 12, priceMultiplier: 0.8 },
            { name: 'East Pavilion Lower', code: 'EPL', rows: 20, seatsPerRow: 200, angle: 90, color: '#a78bfa', elevation: 5, priceMultiplier: 1.5 },
            { name: 'East Pavilion Upper', code: 'EPU', rows: 15, seatsPerRow: 200, angle: 90, color: '#c4b5fd', elevation: 15, priceMultiplier: 1.3 },
            { name: 'West Pavilion Lower', code: 'WPL', rows: 20, seatsPerRow: 200, angle: 270, color: '#fb923c', elevation: 5, priceMultiplier: 1.5 },
            { name: 'West Pavilion Upper', code: 'WPU', rows: 15, seatsPerRow: 200, angle: 270, color: '#fdba74', elevation: 15, priceMultiplier: 1.3 },
            { name: 'North-East Corner', code: 'NE', rows: 15, seatsPerRow: 100, angle: 45, color: '#f472b6', elevation: 2, priceMultiplier: 1.2 },
            { name: 'South-East Corner', code: 'SE', rows: 15, seatsPerRow: 100, angle: 135, color: '#facc15', elevation: 2, priceMultiplier: 1.2 },
            { name: 'South-West Corner', code: 'SW', rows: 15, seatsPerRow: 100, angle: 225, color: '#34d399', elevation: 2, priceMultiplier: 1.2 },
            { name: 'North-West Corner', code: 'NW', rows: 15, seatsPerRow: 100, angle: 315, color: '#f87171', elevation: 2, priceMultiplier: 1.2 },
            { name: 'VIP Box North', code: 'VN', rows: 5, seatsPerRow: 50, angle: 0, color: '#fcd34d', elevation: 20, priceMultiplier: 3.0 },
            { name: 'VIP Box South', code: 'VS', rows: 5, seatsPerRow: 50, angle: 180, color: '#fcd34d', elevation: 20, priceMultiplier: 3.0 },
            { name: 'VIP Box East', code: 'VE', rows: 5, seatsPerRow: 40, angle: 90, color: '#fde047', elevation: 20, priceMultiplier: 3.0 },
            { name: 'VIP Box West', code: 'VW', rows: 5, seatsPerRow: 40, angle: 270, color: '#fde047', elevation: 20, priceMultiplier: 3.0 }
        ],
        dimensions: {
            radius: 100,
            standHeight: 30,
            standDepth: 35,
            roofEnabled: true,
            roofHeight: 50
        },
        floodlights: FLOODLIGHT_CONFIG.large
    }
};

/**
 * Get stadium model by code
 * @param {string} code - Stadium model code
 * @returns {Object} Stadium configuration
 */
export function getStadiumModel(code) {
    return STADIUM_MODELS[code] || STADIUM_MODELS.small;
}

/**
 * Get stadium theme by name
 * @param {string} themeName - Theme name
 * @returns {Object} Theme configuration
 */
export function getStadiumTheme(themeName = 'default') {
    return STADIUM_THEMES[themeName] || STADIUM_THEMES.default;
}

/**
 * Calculate 3D position for a seat
 * @param {Object} section - Section configuration
 * @param {number} row - Row number (1-indexed)
 * @param {number} seatNum - Seat number (1-indexed)
 * @param {Object} dimensions - Stadium dimensions
 * @returns {Object} { x, y, z } position
 */
export function calculateSeatPosition(section, row, seatNum, dimensions) {
    const angleRad = (section.angle * Math.PI) / 180;
    const sectionArc = Math.PI / 2.5; // 72 degrees per section for better spacing

    // Calculate position within section arc
    const seatPercentage = section.seatsPerRow > 1
        ? (seatNum - 1) / (section.seatsPerRow - 1)
        : 0.5;
    const seatAngle = angleRad - (sectionArc / 2) + (seatPercentage * sectionArc);

    // Calculate radius based on row (further rows are further from pitch)
    const rowOffset = dimensions.radius + 5 + (row * 1.5);

    // Calculate height based on row and section elevation
    // Higher rows have steeper angle for better view
    const baseHeight = section.elevation || 0;
    const rowHeight = row * 0.6;
    const tierSlope = row * 0.3; // Additional height for stadium bowl shape

    return {
        x: Math.cos(seatAngle) * rowOffset,
        y: baseHeight + rowHeight + tierSlope,
        z: Math.sin(seatAngle) * rowOffset
    };
}

/**
 * Parse seat ID to extract section, row, and seat number
 * @param {string} seatId - Format: 'NS-R01-S001'
 * @returns {Object|null} { sectionCode, row, seatNumber }
 */
export function parseSeatId(seatId) {
    if (!seatId || typeof seatId !== 'string') return null;

    const parts = seatId.split('-');
    if (parts.length !== 3) return null;

    const row = parseInt(parts[1].replace('R', ''), 10);
    const seatNumber = parseInt(parts[2].replace('S', ''), 10);

    if (isNaN(row) || isNaN(seatNumber)) return null;

    return {
        sectionCode: parts[0],
        row,
        seatNumber
    };
}

/**
 * Get section by code from a stadium model
 * @param {string} modelCode - Stadium model code
 * @param {string} sectionCode - Section code
 * @returns {Object|undefined} Section configuration
 */
export function getSectionByCode(modelCode, sectionCode) {
    const model = getStadiumModel(modelCode);
    return model.sections.find(s => s.code === sectionCode);
}

/**
 * Get all section codes for a stadium model
 * @param {string} modelCode - Stadium model code
 * @returns {string[]} Array of section codes
 */
export function getSectionCodes(modelCode) {
    const model = getStadiumModel(modelCode);
    return model.sections.map(s => s.code);
}

/**
 * Calculate camera positions for section focus
 * @param {Object} section - Section to focus on
 * @param {Object} dimensions - Stadium dimensions
 * @returns {Object} { position, target }
 */
export function getSectionCameraPosition(section, dimensions) {
    const angleRad = (section.angle * Math.PI) / 180;
    const distance = dimensions.radius * 0.6;
    const height = dimensions.standHeight + (section.elevation || 0) + 20;

    return {
        position: {
            x: Math.cos(angleRad) * distance,
            y: height,
            z: Math.sin(angleRad) * distance
        },
        target: {
            x: Math.cos(angleRad) * (dimensions.radius + 10),
            y: section.elevation || 5,
            z: Math.sin(angleRad) * (dimensions.radius + 10)
        }
    };
}

export default {
    STADIUM_MODELS,
    SECTION_COLORS,
    STADIUM_THEMES,
    FLOODLIGHT_CONFIG,
    ANIMATION_CONFIG,
    getStadiumModel,
    getStadiumTheme,
    calculateSeatPosition,
    parseSeatId,
    getSectionByCode,
    getSectionCodes,
    getSectionCameraPosition
};
