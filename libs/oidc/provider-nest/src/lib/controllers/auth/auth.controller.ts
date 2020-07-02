import { Controller, Get, Param, Next } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Get()
    async helloGet() {
        return "Hello from auth";
    }
    @Get(':uid')
    async authGet(@Param() params, @Next() next) {
        console.log("authGet", params.uid);
        return next();
    }

    @Get('oidc/auth/:uid')
    async authGet2(@Param() params, @Next() next) {
        console.log("authGet2", params.uid);
        return next();
    }

    @Get('auth/:uid')
    async authGet3(@Param() params, @Next() next) {
        console.log("authGet3", params.uid);
        return next();
    }
}
