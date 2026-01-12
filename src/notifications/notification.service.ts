import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import notificationapi from 'notificationapi-node-server-sdk'

import { PlanItem } from "src/meal_plan/entities/plan_item.entity";
import { GetTypeText } from "src/utils";

const NUMBERS_TO_SEND = ['+16049167265', '+16047859202'];

@Injectable()
export class NotificationService {
    constructor(
        private configService: ConfigService
    ) {
        const NOTIFY_API_ID = this.configService.get<string>('NOTIFICATION_API_ID');
        const NOTIFY_API_SEC = this.configService.get<string>('NOTIFICATION_API_SECRET');

        notificationapi.init(
            NOTIFY_API_ID!, // Client ID
            NOTIFY_API_SEC! // Client Secret
        )
    }

    SendNotification(content: string) {
        for (const number of NUMBERS_TO_SEND) {
            notificationapi.send({
                type: 'mealplanner',
                to: {
                    id: 'jakebutterfield99@outlook.com',
                    number: number
                },
                sms: {
                    message: content
                }
            }).catch(err => console.log("NOTIFICATION ERR", err));
        }
    }

    NotifyMealPlan(date: Date, planItems: PlanItem[], ingredients: string[]) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");

        // Format the plan items into list
        let planList = "";
        for (const item of planItems)
            planList = planList + `\n  - ${item.food.name} (${item.assigned} - ${GetTypeText(item.type)})`;

        // Format any alert ingredients into a list
        let ingredientsList = "";
        if (ingredients && ingredients.length > 0) {
            ingredientsList = ingredientsList + "\n\nAlert Ingredients:";
            for (const ingredient of ingredients) {
                ingredientsList = ingredientsList + `\n  - ${ingredient}`;
            }
        }

        let text = `Meal Plan for tomorrow (${day}/${month}): ${planList} ${ingredientsList}`;

        this.SendNotification(text);
    }
}