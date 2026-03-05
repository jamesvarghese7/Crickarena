import mongoose from 'mongoose';

/**
 * StadiumModel
 * Predefined stadium configurations with section layouts for 3D visualization
 * Small (5K), Medium (15K), Large (30K) capacity stadiums
 */

const sectionConfigSchema = new mongoose.Schema({
    name: { type: String, required: true },           // 'North Stand', 'VIP Box'
    code: { type: String, required: true },           // 'NS', 'VIP' - short code for seat IDs
    rows: { type: Number, required: true, min: 1 },   // Number of rows in section
    seatsPerRow: { type: Number, required: true, min: 1 },
    priceMultiplier: { type: Number, default: 1.0 },  // 1.0 = base price, 1.5 = 50% more
    position: {                                        // 3D positioning info
        angle: { type: Number, default: 0 },          // Angular position (0-360)
        radius: { type: Number, default: 100 },       // Distance from center
        elevation: { type: Number, default: 0 }       // Height offset
    },
    color: { type: String, default: '#4ade80' }       // Section color in 3D view
}, { _id: false });

const stadiumModelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },  // 'Small Stadium'
    code: { type: String, required: true, unique: true },  // 'small', 'medium', 'large'
    description: { type: String },
    totalCapacity: { type: Number, required: true },

    // Section configurations
    sections: [sectionConfigSchema],

    // 3D model metadata
    dimensions: {
        pitchLength: { type: Number, default: 137 },    // Cricket pitch area
        pitchWidth: { type: Number, default: 137 },
        boundaryRadius: { type: Number, default: 68 }   // Boundary circle radius
    },

    // Visual settings
    theme: {
        primaryColor: { type: String, default: '#10b981' },
        secondaryColor: { type: String, default: '#1e293b' },
        grassColor: { type: String, default: '#22c55e' }
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual for calculating capacity from sections
stadiumModelSchema.virtual('calculatedCapacity').get(function () {
    return this.sections.reduce((sum, s) => sum + (s.rows * s.seatsPerRow), 0);
});

stadiumModelSchema.set('toJSON', { virtuals: true });
stadiumModelSchema.set('toObject', { virtuals: true });

export default mongoose.model('StadiumModel', stadiumModelSchema);
