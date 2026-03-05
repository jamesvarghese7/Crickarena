/**
 * Stadium Generator Utility
 * Generates seat layouts for 3D stadiums with auto-lock logic
 */

// Default stadium configurations
export const STADIUM_MODELS = {
    small: {
        name: 'Small Stadium',
        code: 'small',
        description: 'Compact stadium ideal for local tournaments and league matches',
        totalCapacity: 4500, // 1250+1250+1000+1000
        sections: [
            { name: 'North Stand', code: 'NS', rows: 10, seatsPerRow: 125, priceMultiplier: 1.0, angle: 0, color: '#4ade80' },
            { name: 'South Stand', code: 'SS', rows: 10, seatsPerRow: 125, priceMultiplier: 1.0, angle: 180, color: '#22d3ee' },
            { name: 'East Pavilion', code: 'EP', rows: 10, seatsPerRow: 100, priceMultiplier: 1.5, angle: 90, color: '#a78bfa' },
            { name: 'West Pavilion', code: 'WP', rows: 10, seatsPerRow: 100, priceMultiplier: 1.5, angle: 270, color: '#fb923c' }
        ],
        dimensions: { pitchLength: 100, pitchWidth: 100, boundaryRadius: 50 }
    },
    medium: {
        name: 'Medium Stadium',
        code: 'medium',
        description: 'Standard stadium for regional tournaments and semi-finals',
        totalCapacity: 13500, // 4000+4000+2250+2250+750+750
        sections: [
            { name: 'North Stand', code: 'NS', rows: 20, seatsPerRow: 200, priceMultiplier: 1.0, angle: 0, color: '#4ade80' },
            { name: 'South Stand', code: 'SS', rows: 20, seatsPerRow: 200, priceMultiplier: 1.0, angle: 180, color: '#22d3ee' },
            { name: 'East Pavilion', code: 'EP', rows: 15, seatsPerRow: 150, priceMultiplier: 1.5, angle: 90, color: '#a78bfa' },
            { name: 'West Pavilion', code: 'WP', rows: 15, seatsPerRow: 150, priceMultiplier: 1.5, angle: 270, color: '#fb923c' },
            { name: 'North-East Corner', code: 'NE', rows: 10, seatsPerRow: 75, priceMultiplier: 1.2, angle: 45, color: '#f472b6' },
            { name: 'North-West Corner', code: 'NW', rows: 10, seatsPerRow: 75, priceMultiplier: 1.2, angle: 315, color: '#facc15' }
        ],
        dimensions: { pitchLength: 120, pitchWidth: 120, boundaryRadius: 60 }
    },
    large: {
        name: 'Large Stadium',
        code: 'large',
        description: 'Premium stadium for finals and major international matches',
        totalCapacity: 31000, // 7500+6000+7500+6000+4000+4000+250+250
        sections: [
            { name: 'North Stand Lower', code: 'NSL', rows: 25, seatsPerRow: 300, priceMultiplier: 1.0, angle: 0, color: '#4ade80' },
            { name: 'North Stand Upper', code: 'NSU', rows: 20, seatsPerRow: 300, priceMultiplier: 0.8, angle: 0, color: '#86efac' },
            { name: 'South Stand Lower', code: 'SSL', rows: 25, seatsPerRow: 300, priceMultiplier: 1.0, angle: 180, color: '#22d3ee' },
            { name: 'South Stand Upper', code: 'SSU', rows: 20, seatsPerRow: 300, priceMultiplier: 0.8, angle: 180, color: '#67e8f9' },
            { name: 'East Pavilion', code: 'EP', rows: 20, seatsPerRow: 200, priceMultiplier: 1.5, angle: 90, color: '#a78bfa' },
            { name: 'West Pavilion', code: 'WP', rows: 20, seatsPerRow: 200, priceMultiplier: 1.5, angle: 270, color: '#fb923c' },
            { name: 'VIP Box North', code: 'VN', rows: 5, seatsPerRow: 50, priceMultiplier: 3.0, angle: 0, color: '#fcd34d' },
            { name: 'VIP Box South', code: 'VS', rows: 5, seatsPerRow: 50, priceMultiplier: 3.0, angle: 180, color: '#fcd34d' }
        ],
        dimensions: { pitchLength: 137, pitchWidth: 137, boundaryRadius: 68 }
    }
};

/**
 * Generate all seats for a stadium model with pricing
 * @param {string} modelCode - 'small', 'medium', or 'large'
 * @param {number} basePrice - Base ticket price in INR
 * @param {number} activeCapacity - Number of seats to keep active (rest locked)
 * @returns {Object} { seats: [], lockedSections: [] }
 */
export function generateSeats(modelCode, basePrice = 500, activeCapacity = null) {
    const model = STADIUM_MODELS[modelCode];
    if (!model) {
        throw new Error(`Unknown stadium model: ${modelCode}`);
    }

    const seats = [];
    const sectionSeats = {};

    // Generate all seats for each section
    for (const section of model.sections) {
        sectionSeats[section.code] = [];

        for (let row = 1; row <= section.rows; row++) {
            for (let seatNum = 1; seatNum <= section.seatsPerRow; seatNum++) {
                const seatId = `${section.code}-R${String(row).padStart(2, '0')}-S${String(seatNum).padStart(3, '0')}`;
                const price = Math.round(basePrice * section.priceMultiplier);

                const seat = {
                    seatId,
                    section: section.name,
                    row,
                    seatNumber: seatNum,
                    status: 'available',
                    price
                };

                seats.push(seat);
                sectionSeats[section.code].push(seat);
            }
        }
    }

    // Apply auto-lock if activeCapacity is specified
    const lockedSections = [];
    if (activeCapacity && activeCapacity < model.totalCapacity) {
        const seatsToLock = model.totalCapacity - activeCapacity;
        let lockedCount = 0;

        // Lock sections from furthest (upper tiers first, then corners, then back rows)
        // Priority order for locking: Upper tiers > Corners > Back rows of main stands
        const lockPriority = [...model.sections].sort((a, b) => {
            // Upper tiers first
            if (a.name.includes('Upper') && !b.name.includes('Upper')) return -1;
            if (!a.name.includes('Upper') && b.name.includes('Upper')) return 1;
            // Then corners
            if (a.name.includes('Corner') && !b.name.includes('Corner')) return -1;
            if (!a.name.includes('Corner') && b.name.includes('Corner')) return 1;
            // Then by price (cheaper first)
            return a.priceMultiplier - b.priceMultiplier;
        });

        for (const section of lockPriority) {
            if (lockedCount >= seatsToLock) break;

            const sectionSeatCount = section.rows * section.seatsPerRow;

            // Lock entire section if it fits
            if (lockedCount + sectionSeatCount <= seatsToLock) {
                for (const seat of sectionSeats[section.code]) {
                    seat.status = 'locked';
                    lockedCount++;
                }
                lockedSections.push(section.name);
            } else {
                // Lock back rows first
                const seatsNeeded = seatsToLock - lockedCount;
                const rowsToLock = Math.ceil(seatsNeeded / section.seatsPerRow);

                for (let row = section.rows; row > section.rows - rowsToLock && lockedCount < seatsToLock; row--) {
                    for (const seat of sectionSeats[section.code]) {
                        if (seat.row === row && lockedCount < seatsToLock) {
                            seat.status = 'locked';
                            lockedCount++;
                        }
                    }
                }
            }
        }
    }

    return { seats, lockedSections };
}

/**
 * Get stadium model info
 * @param {string} modelCode 
 * @returns {Object} Stadium model configuration
 */
export function getStadiumModel(modelCode) {
    return STADIUM_MODELS[modelCode] || null;
}

/**
 * List all available stadium models
 * @returns {Array} List of stadium models with summary info
 */
export function listStadiumModels() {
    return Object.values(STADIUM_MODELS).map(model => ({
        code: model.code,
        name: model.name,
        description: model.description,
        totalCapacity: model.totalCapacity,
        sectionCount: model.sections.length
    }));
}

/**
 * Calculate seat availability summary
 * @param {Array} seats - Array of seat objects
 * @returns {Object} Summary of seat statuses
 */
export function getSeatSummary(seats) {
    const summary = {
        total: seats.length,
        available: 0,
        booked: 0,
        locked: 0,
        pending: 0,
        bySection: {}
    };

    for (const seat of seats) {
        summary[seat.status]++;

        if (!summary.bySection[seat.section]) {
            summary.bySection[seat.section] = { available: 0, booked: 0, locked: 0, pending: 0 };
        }
        summary.bySection[seat.section][seat.status]++;
    }

    return summary;
}

export default {
    STADIUM_MODELS,
    generateSeats,
    getStadiumModel,
    listStadiumModels,
    getSeatSummary
};
