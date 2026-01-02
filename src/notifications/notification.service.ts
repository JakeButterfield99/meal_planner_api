import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import notificationapi from 'notificationapi-node-server-sdk'

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
        notificationapi.send({
            type: 'mealplanner',
            to: {
                id: 'jakebutterfield99@outlook.com',
                number: '+16049167265'
            },
            sms: {
                message: content
            }
        }).then(res => console.log(res.data))
    }
}