import * as Sequelize from 'sequelize';

import { SequelizeAttributes } from '../../typings/SequelizeAttributes';

const SESSIONS_TABLE = 'sessions';
const ACCESS_TOKEN_TABLE = 'access_tokens';
const AUTHORIZATION_CODES_TABLE = 'authorization_codes';
const REFRESH_TOKENS_TABLE = 'refresh_tokens';
const DEVICE_CODES_TABLE = 'device_codes';
const CLIENT_CREDENTIALS_TABLE = 'client_credentials';
const CLIENT_TABLE = 'clients';
const INITIAL_ACCESS_TOKEN_TABLE = 'initial_access_tokens';
const REGISTRATION_ACCESS_TOKEN_TABLE = 'registration_access_tokens';

export interface IAdapterAttrs {
  id: string;
  grantId: string;
  userCode: string;
  data: string;
  expiresAt: string;
  consumedAt: string;
}

export interface IOIDCInstance extends Sequelize.Instance<IAdapterAttrs>, IAdapterAttrs {}

export const SessionFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const Sessions = sequelize.define<IOIDCInstance, IAdapterAttrs>(SESSIONS_TABLE, attributes);

  return Sessions;
};

export const AccessTokenFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const AccessTokens = sequelize.define<IOIDCInstance, IAdapterAttrs>(ACCESS_TOKEN_TABLE, attributes);

  return AccessTokens;
};

export const AuthorizationCodeFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const AuthorizationCodes = sequelize.define<IOIDCInstance, IAdapterAttrs>(AUTHORIZATION_CODES_TABLE, attributes);

  return AuthorizationCodes;
};

export const RefreshTokenFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const RefreshTokens = sequelize.define<IOIDCInstance, IAdapterAttrs>(REFRESH_TOKENS_TABLE, attributes);

  return RefreshTokens;
};

export const DeviceCodeFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const DeviceCodes = sequelize.define<IOIDCInstance, IAdapterAttrs>(DEVICE_CODES_TABLE, attributes);

  return DeviceCodes;
};

export const ClientCredentialsFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const ClientCredentials = sequelize.define<IOIDCInstance, IAdapterAttrs>(CLIENT_CREDENTIALS_TABLE, attributes);

  return ClientCredentials;
};

export const ClientsFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const Clients = sequelize.define<IOIDCInstance, IAdapterAttrs>(CLIENT_TABLE, attributes);

  return Clients;
};

export const InitialAccessTokensFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const InitialAccessTokens = sequelize.define<IOIDCInstance, IAdapterAttrs>(INITIAL_ACCESS_TOKEN_TABLE, attributes);

  return InitialAccessTokens;
};

export const RegistrationAccessTokensFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IOIDCInstance, IAdapterAttrs> => {
  const attributes: SequelizeAttributes<IAdapterAttrs> = {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    grantId: {
      type: DataTypes.STRING
    },
    userCode: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.DATE
    },
    consumedAt: {
      type: DataTypes.DATE
    }
  };

  const RegistrationAccessTokens = sequelize.define<IOIDCInstance, IAdapterAttrs>(
    REGISTRATION_ACCESS_TOKEN_TABLE,
    attributes
  );

  return RegistrationAccessTokens;
};
