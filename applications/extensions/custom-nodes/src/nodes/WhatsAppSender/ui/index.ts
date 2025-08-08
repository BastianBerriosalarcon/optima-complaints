
import { operations } from './operations';
import { recipientPhone } from './recipientPhone';
import { textMessageFields } from './textMessageFields';
import { templateMessageFields } from './templateMessageFields';
import { mediaMessageFields } from './mediaMessageFields';
import { interactiveMessageFields } from './interactiveMessageFields';
import { statusFields } from './statusFields';
import { validationOptions } from './validationOptions';
import { deliveryOptions } from './deliveryOptions';
import { additionalOptions } from './additionalOptions';

export const whatsAppSenderProperties = [
    operations,
    recipientPhone,
    ...textMessageFields,
    ...templateMessageFields,
    ...mediaMessageFields,
    ...interactiveMessageFields,
    ...statusFields,
    validationOptions,
    deliveryOptions,
    additionalOptions,
];
