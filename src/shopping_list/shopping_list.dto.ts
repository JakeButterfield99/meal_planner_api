export class GenerateListDto {
    planId?: number;
}

export class RemoveIgnoredItemDto {
    itemId?: number;
}

export class AddIngredientToListDto {
    item: string;
}

export class UpdateListDto {
    id?: number;
    checked?: boolean;
    ignore?: boolean;
    remove?: boolean;
}