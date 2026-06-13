import { PartialType } from '@nestjs/swagger';
import { CreateOneOnOneDto } from './create-one-on-one.dto';

export class UpdateOneOnOneDto extends PartialType(CreateOneOnOneDto) {}
