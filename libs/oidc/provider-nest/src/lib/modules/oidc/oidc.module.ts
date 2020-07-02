import { Module } from '@nestjs/common';
import { OidcController } from '../../controllers/oidc/oidc.controller';

@Module({
    imports: [],
    exports: [],
    providers: [],
    controllers: [OidcController],
})
export class OidcModule {}
