import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JWTAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
// biome-ignore lint/style/useImportType: Reflect metadata
import { UserUpdate } from '../dto/user-update.dto';
import type { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';

@Controller('profile')
@UseGuards(JWTAuthGuard, SessionAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ProfileController {
  @Inject(UserService)
  private readonly userService: UserService;

  @Get(':id')
  get(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    return this.userService.findOne({ where: { id } });
  }

  @Put(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updatesUser: UserUpdate
  ): Promise<User> {
    return this.userService.update(id, updatesUser);
  }
}
