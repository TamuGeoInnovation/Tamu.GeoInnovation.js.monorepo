import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ClientMetadata, ClientMetadataRepo, GrantTypeRepo, GrantType } from '../../entities/all.entity';

@Injectable()
export class ClientMetadataService {
  constructor(private readonly clientMetadataRepo: ClientMetadataRepo) { }

  // ClientMetadata functions
  public async getClient(clientName: string) {
    if (clientName) {
      return this.clientMetadataRepo.findByKey('clientName', clientName);
    } else {
      throw new Error('No clientIdentifier provided');
    }

  }

  public async getAllClients() { }

  // public static async insertClient(req: Request): Promise<boolean> {
  //   const connection = getConnection();
  //   const grants: string[] = req.body.grantTypes;
  //   const grantTypes: GrantType[] = await connection.getRepository(GrantType).find({
  //     type: In(grants)
  //   })
  //   const _client: Partial<ClientMetadata> = {
  //     clientName: req.body.clientName,
  //     clientSecret: req.body.clientSecret,
  //     grantTypes: grantTypes,
  //     token_endpoint_auth_method: req.body.token_endpoint_auth_method,

  //   }
  //   const client = connection.getRepository(ClientMetadata).create(_client);

  //   return new Promise((resolve, reject) => {
  //     connection
  //       .getRepository(ClientMetadata)
  //       .save(client)
  //       .then((result) => {
  //         if (result) {
  //           resolve(true);
  //         } else {
  //           resolve(false);
  //         }
  //       })
  //       .catch((typeOrmErr) => {
  //         reject(typeOrmErr);
  //       });
  //   });
  // }

  // // GrantType functions
  // public static async insertGrantType(req: Request): Promise<boolean> {
  //   const connection = getConnection();
  //   const grant: Partial<GrantType> = {
  //     name: req.body.name,
  //     type: req.body.type,
  //     details: req.body.details
  //   };
  //   const grantType = connection.getRepository(GrantType).create(grant);

  //   return new Promise((resolve, reject) => {
  //     connection
  //       .getRepository(GrantType)
  //       .save(grantType)
  //       .then((result) => {
  //         if (result) {
  //           resolve(true);
  //         } else {
  //           resolve(false);
  //         }
  //       })
  //       .catch((typeOrmErr) => {
  //         reject(typeOrmErr);
  //       });
  //   });
  // }
}
