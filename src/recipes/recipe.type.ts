export type Recipe = {
    id: string,
    name: string,
}

export type RecipeData = {
    text: string,
    type: string,
}

export type RecipeContents = {
    ingredients: RecipeData[],
    method: RecipeData[],
}