import { Module } from '@nestjs/common';
import { AuthController } from '../../controllers/auth/auth.controller';

@Module({
    imports: [],
    exports: [],
    providers: [],
    controllers: [AuthController]
})
export class AuthModule { }
