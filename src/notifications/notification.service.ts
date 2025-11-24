import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import * as twilio from 'twilio';

@Injectable()
export class NotificationService {
    private client: twilio.Twilio;
    private from_number: string;

    constructor(
        private configService: ConfigService
    ) {
        const TWILIO_ACCOUNT_SID = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const TWILIO_AUTH_TOKEN = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        const TWILIO_FROM_NUMBER = this.configService.get<string>('TWILIO_FROM_NUMBER');

        const twilio_module = require("twilio");
        this.client = twilio_module(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        this.from_number = TWILIO_FROM_NUMBER || "";
    }

    SendNotification(content: string) {
        console.log("SENDING MESSAGE", content);

        this.client.messages.create({
            to: "+16049167265",
            from: this.from_number,
            body: content,
        })
            .then(message => {
                console.log("MESSAGE SENT", message.sid);
            })
            .catch(err => {
                console.log("MESSAGE ERR", err);
            });
    }
}