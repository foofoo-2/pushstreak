export interface Variation {
    id?: string; // UUID, optional for new creation before save
    name: string;
    pointsPerRep: number;
    isDefault: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    goalPoints: number;
    notes?: string;
    painScore?: number; // 0-3
    rpe?: number; // 1-10
    isRestDay: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Entry {
    id?: string; // UUID
    date: string; // YYYY-MM-DD (FK to DailyLog)
    time: string; // HH:mm
    variationId: string;
    sets: number;
    repsMode: 'uniform' | 'perSet';
    repsUniform?: number;
    repsPerSet?: number[];
    repsTotal: number;
    pointsTotal: number;
    note?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type RepsMode = 'uniform' | 'perSet';
