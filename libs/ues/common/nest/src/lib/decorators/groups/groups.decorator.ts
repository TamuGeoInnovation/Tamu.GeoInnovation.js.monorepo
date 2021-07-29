import { SetMetadata } from '@nestjs/common';
import { ROLES } from '@tamu-gisc/ues/common/types';

export const GROUPS_KEY = 'groups';
export const RequiredGroups = (groups: Array<ROLES>) => SetMetadata(GROUPS_KEY, groups);
