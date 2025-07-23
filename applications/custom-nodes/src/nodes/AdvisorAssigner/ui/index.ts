
import { leadData } from './leadData';
import { assignmentCriteria } from './assignmentCriteria';
import { filters } from './filters';
import { reassignmentFields } from './reassignmentFields';
import { workloadAndAvailability } from './workloadAndAvailability';
import { availabilityUpdate } from './availabilityUpdate';
import { strategyOptions } from './strategyOptions';
import { additionalOptions } from './additionalOptions';
import { operations } from './operations';

export const advisorAssignerProperties = [
    operations,
    leadData,
    assignmentCriteria,
    filters,
    ...reassignmentFields,
    ...workloadAndAvailability,
    ...availabilityUpdate,
    strategyOptions,
    additionalOptions,
];
