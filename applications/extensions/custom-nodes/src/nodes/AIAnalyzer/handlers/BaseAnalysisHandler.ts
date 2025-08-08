import { IExecuteFunctions } from 'n8n-workflow';
import { ServiceResponse } from '@shared/types/core';

export interface IAnalysisHandler {
    execute(context: IExecuteFunctions, input: any): Promise<ServiceResponse<any>>;
}
