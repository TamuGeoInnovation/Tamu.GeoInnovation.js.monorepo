export interface ISimplifiedUserRoleResponse {
  role: {
    level: string;
    name: string;
  };
  user: {
    email: string;
    name: string;
  };
  client: {
    clientId: string;
    clientName: string;
  };
}

export interface IClientData {
  application_type: string;
  grant_types: string[];
  id_token_signed_response_alg: string;
  post_logoout_redirect_uris: string[];
  require_auth_time: boolean;
  response_types: string[];
  subject_type: string;
  token_endpoint_auth_method: string;
  revocation_endpoint_auth_method: string;
  backchannel_logout_session_required: boolean;
  require_signed_request_object: boolean;
  request_uris: string[];
  client_id_issued_at: number;
  client_id: string;
  client_name: string;
  redirect_uris: string[];
}
