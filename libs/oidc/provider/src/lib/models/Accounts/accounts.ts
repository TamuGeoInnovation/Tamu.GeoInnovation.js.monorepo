import * as Sequelize from 'sequelize';

import { SequelizeAttributes } from '../../typings/SequelizeAttributes';

const ACCOUNTS_TABLE = 'accounts';
const TAMU_TABLE = 'accounts_tamus';
const SECRET_QUESTIONS_TABLE = 'secret_questions';
const SECRET_ANSWERS_TABLE = 'secret_answers';
const PW_RESET_TABLE = 'user_pw_reset';

export interface IAccountAttrs {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  profile: string;
  picture: string;
  website: string;
  email: string;
  email_verified: boolean;
  gender: string;
  birthdate: string;
  zoneinfo: string;
  locale: string;
  phone_number: string;
  phone_number_verified: boolean;
  address: string; // actually a JSON representation
  updated_at?: string; // tried with a type of number and it causes a dumb "cannot find 'length' of undefined" error
  added?: string;
  last_edited?: string;
  recovery_email?: string;
  recovery_email_verified?: string;
  signup_ip_address?: string;
  last_used_ip_address?: string;
}

export interface ITAMUAttrs {
  sub: string;
  uin_tamu: string;
  department_tamu: string;
  fieldofstudy_tamu: string;
  classification_tamu: string;
  completed_initial_survey_tamu: string;
}

export interface ISecretQuestions {
  question_text: string;
}

export interface ISecretAnswers {
  accounts_sub: string;
  question_id: string;
  answer: string;
}

export interface IResetPWAttrs {
  token?: string;
  account_sub?: string;
  initializer_ip?: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface IAccountsInstance extends Sequelize.Instance<IAccountAttrs>, IAccountAttrs {}

export interface ITAMUInstance extends Sequelize.Instance<ITAMUAttrs>, ITAMUAttrs {}

export interface ISecretQuestionsInstance extends Sequelize.Instance<ISecretQuestions>, ISecretQuestions {}

export interface ISecretAnswersInstance extends Sequelize.Instance<ISecretAnswers>, ISecretAnswers {}

export interface IResetPWInstance extends Sequelize.Instance<IResetPWAttrs>, IResetPWAttrs {}

export const AccountsFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IAccountsInstance, IAccountAttrs> => {
  const attributes: SequelizeAttributes<IAccountAttrs> = {
    sub: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    given_name: {
      type: DataTypes.STRING
    },
    family_name: {
      type: DataTypes.STRING
    },
    nickname: {
      type: DataTypes.STRING
    },
    profile: {
      type: DataTypes.STRING
    },
    picture: {
      type: DataTypes.STRING
    },
    website: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    email_verified: {
      type: DataTypes.BOOLEAN
    },
    gender: {
      type: DataTypes.STRING
    },
    birthdate: {
      type: DataTypes.STRING
    },
    zoneinfo: {
      type: DataTypes.STRING
    },
    locale: {
      type: DataTypes.STRING
    },
    phone_number: {
      type: DataTypes.STRING
    },
    phone_number_verified: {
      type: DataTypes.BOOLEAN
    },
    address: {
      type: DataTypes.STRING
    },
    updated_at: {
      type: DataTypes.INTEGER // tried with a type of number and it causes a dumb "cannot find 'length' of undefined" error; seems to work with type STRING
    },
    added: {
      type: DataTypes.STRING
    },
    last_edited: {
      type: DataTypes.STRING
    },
    signup_ip_address: {
      type: DataTypes.STRING
    },
    last_used_ip_address: {
      type: DataTypes.STRING
    },
    recovery_email: {
      type: DataTypes.STRING
    },
    recovery_email_verified: {
      type: DataTypes.STRING
    }
  };

  const Accounts = sequelize.define<IAccountsInstance, IAccountAttrs>(ACCOUNTS_TABLE, attributes);

  return Accounts;
};

export const AccountsTAMUFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<ITAMUInstance, ITAMUAttrs> => {
  const attributes: SequelizeAttributes<ITAMUAttrs> = {
    sub: {
      type: DataTypes.STRING
    },
    uin_tamu: {
      type: DataTypes.STRING
    },
    department_tamu: {
      type: DataTypes.STRING
    },
    fieldofstudy_tamu: {
      type: DataTypes.STRING
    },
    classification_tamu: {
      type: DataTypes.STRING
    },
    completed_initial_survey_tamu: {
      type: DataTypes.STRING,
      field: 'completed_initial_survey'
    }
  };

  const AccountsTAMU = sequelize.define<ITAMUInstance, ITAMUAttrs>(TAMU_TABLE, attributes);
  return AccountsTAMU;
};

export const SecretQuestionFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<ISecretQuestionsInstance, ISecretQuestions> => {
  const attributes: SequelizeAttributes<ISecretQuestions> = {
    question_text: {
      type: DataTypes.STRING
    }
  };

  const SecretQuestions = sequelize.define<ISecretQuestionsInstance, ISecretQuestions>(SECRET_QUESTIONS_TABLE, attributes);
  return SecretQuestions;
};

export const SecretAnswerFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<ISecretAnswersInstance, ISecretAnswers> => {
  const attributes: SequelizeAttributes<ISecretAnswers> = {
    accounts_sub: {
      type: DataTypes.STRING
    },
    question_id: {
      type: DataTypes.STRING
    },
    answer: {
      type: DataTypes.STRING
    }
  };

  const SecretAnswers = sequelize.define<ISecretAnswersInstance, ISecretAnswers>(SECRET_ANSWERS_TABLE, attributes);
  return SecretAnswers;
};

export const ResetPWFactory = (
  sequelize: Sequelize.Sequelize,
  DataTypes: Sequelize.DataTypes
): Sequelize.Model<IResetPWInstance, IResetPWAttrs> => {
  const attributes: SequelizeAttributes<IResetPWAttrs> = {
    account_sub: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.STRING
    },
    initializer_ip: {
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.STRING
    },
    expiresAt: {
      type: DataTypes.STRING
    }
  };

  const ResetPW = sequelize.define<IResetPWInstance, IResetPWAttrs>(PW_RESET_TABLE, attributes);
  return ResetPW;
};
