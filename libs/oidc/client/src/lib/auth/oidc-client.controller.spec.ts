import { Test, TestingModule } from '@nestjs/testing';
import { OidcClientController } from './oidc-client.controller';

// TODO: will have to fix this at a later date; as-is it will not test abstract classes
// describe('OidcClientController Controller', () => {
//   let controller: OidcClientController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [OidcClientController],
//     }).compile();

//     controller = module.get<OidcClientController>(OidcClientController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });
