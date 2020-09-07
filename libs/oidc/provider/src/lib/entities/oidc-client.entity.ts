import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  TableForeignKey,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { IRequiredEntityAttrs } from "./entity.interface";
import { GuidIdentity } from "./guid-identity.entity";

@Entity({
  name: "client_metadata",
})
export class ClientMetadata extends GuidIdentity {


  client_id: string;

  client_secret: string;

  redirect_uris: string[];

  response_types: string[];
  
  token_endpoint_auth_method: string;

  @Column({
    type: "varchar",
    nullable: true,
  })
  added: Date;

  constructor() {
    super();
  }
}


@Entity({
  name: ""
})
export class ResponseType extends GuidIdentity {
  @Column({
    type: "varchar",
    nullable: false,
  })
  added: Date;

  @Column({
    type: "varchar",
    nullable: false,
  })
  responseType: string;
}