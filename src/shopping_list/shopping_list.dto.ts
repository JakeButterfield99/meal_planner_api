export class GenerateListDto {
    planId?: number
}

export class UpdateListDto {
    id?: number;
    checked?: boolean;
    ignore?: boolean;
    remove?: boolean;
}