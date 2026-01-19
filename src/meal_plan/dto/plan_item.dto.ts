export class PlanItemDto {
    planId?: number;
    date?: string;
    assigned?: string;
    type?: number;
    foodId?: number;
    notes?: string;
}

export class AddPlanNoteDto {
    planId?: number;
    date?: string;
    notes?: string;
}