import { MealType } from "./meal_plan/entities/plan_item.entity";

// Parse ingredient name to just retrieve food without measurements, preparation etc.
export function ParseIngredientName(input: string): string {
    let text = input.toLowerCase().trim();

    // Remove parenthetical notes
    text = text.replace(/\([^)]*\)/g, "");

    // Unicode fraction characters
    const fractions = "½⅓⅔¼¾⅛⅜⅝⅞";

    // Remove leading quantities:
    //  - 2-3
    //  - 1/2
    //  - ½
    //  - 1½ / 2 ½
    //  - ~680
    //  - 680
    const quantityRegex = new RegExp(
        `^(~\\s*)?(` +
        `\\d+\\s*(?:-|–|to)\\s*\\d+|` +        // 2-3
        `\\d+\\/\\d+|` +                       // 1/2
        `\\d+\\s*[${fractions}]|` +            // 2 ½
        `\\d+[${fractions}]|` +                // 1½
        `[${fractions}]|` +                    // ½
        `\\d+(?:[.,]\\d+)?` +                  // 680, 1.5
        `)\\s*`,
        "i"
    );

    text = text.replace(quantityRegex, "");

    // Remove units (supports things like g, kg, ml, tsp, tbsp)
    text = text.replace(
        /^(cups?|cup|tablespoons?|tbsp|teaspoons?|tsp|pounds?|lbs?|ounces?|oz|grams?|g|kilograms?|kg|milliliters?|ml|liters?|l|cloves?|pinch|dash|knobs|half|bunch)\b\s*/i,
        ""
    );

    // Remove "of" if it follows a unit
    text = text.replace(/^of\s+/i, "");

    // Remove preparation notes after commas
    text = text.split(",")[0];

    // Remove trailing preparation phrases
    text = text.replace(
        /\b(chopped|diced|minced|sliced|cut|cubed|crushed|grated|cloves|inch|ground|tops|to taste)\b.*$/i,
        ""
    );

    return text.trim();
}

// Get the date key in YYYY-MM-DD format
export function GetDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Get the date keys for the next `count` amount of weeks
export function GetNextDateKeys(count: number): string[] {
    const dateKeys: string[] = [];
    const today = new Date();
    const current = new Date(today);

    const dayOfWeek = current.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7; // handles Sunday as well
    current.setDate(current.getDate() - diffToMonday);
    dateKeys.push(GetDateKey(current));

    for (let i = 1; i < count; i++) {
        const nextMonday = new Date(current);
        nextMonday.setDate(current.getDate() + i * 7);
        dateKeys.push(GetDateKey(nextMonday));
    }

    return dateKeys;
}

const TYPE_TEXT = {
    [MealType.BREAKFAST]: "Breakfast",
    [MealType.LUNCH]: "Lunch",
    [MealType.DINNER]: "Dinner",
    [MealType.SNACK]: "Snack",
}

export function GetTypeText(type: MealType) {
    return TYPE_TEXT[type];
}