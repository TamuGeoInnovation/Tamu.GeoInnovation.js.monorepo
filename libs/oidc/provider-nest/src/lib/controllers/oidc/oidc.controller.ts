import { Controller, Get } from '@nestjs/common';

@Controller('oidc')
export class OidcController {
    @Get('me')
    async me() {
        return "BLAH";
    }
}
