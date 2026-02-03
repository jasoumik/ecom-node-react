import { PartialType } from '@nestjs/mapped-types';
import { CreateAgeGroupDto } from './create-age-group.dto';

export class UpdateAgeGroupDto extends PartialType(CreateAgeGroupDto) {}

