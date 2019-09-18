import {
  Controller,
  UseGuards,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Param,
  ParseIntPipe,
  Put,
  Body,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UserUpdate } from './dto/user-update.dto';
import { PassportGuard } from '../auth/guards/passport.guard';

@Controller('profile')
@UseGuards(PassportGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  get(@Param('id', new ParseIntPipe()) id: number) {
    return this.userService.findOne({ where: { id } });
  }

  @Put(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updatesUser: UserUpdate,
  ) {
    return this.userService.update(id, updatesUser);
  }
}
