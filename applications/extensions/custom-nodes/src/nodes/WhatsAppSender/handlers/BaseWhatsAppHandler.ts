import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';

export interface IWhatsAppHandler {
    execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>>;
}
