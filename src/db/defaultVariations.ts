import type { Variation } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const defaultVariations: Variation[] = [
    {
        id: uuidv4(),
        name: 'Wall Push-up',
        pointsPerRep: 0.25,
        isDefault: false,
    },
    {
        id: uuidv4(),
        name: 'High Incline (Table/Desk)',
        pointsPerRep: 0.5,
        isDefault: false,
    },
    {
        id: uuidv4(),
        name: 'Low Incline (Chair/Bed)',
        pointsPerRep: 0.75,
        isDefault: true, // Making this default for now
    },
    {
        id: uuidv4(),
        name: 'Knee Push-up',
        pointsPerRep: 1.0,
        isDefault: false,
    },
    {
        id: uuidv4(),
        name: 'Standard Floor Push-up',
        pointsPerRep: 1.5,
        isDefault: false,
    },
    {
        id: uuidv4(),
        name: 'Feet Elevated',
        pointsPerRep: 2.0,
        isDefault: false,
    },
];
