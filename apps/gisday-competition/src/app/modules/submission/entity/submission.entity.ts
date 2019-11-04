
export interface ISubmission {
    userGuid: string,
    signType: string,
    description: string,
    local: IGeoLocal,
}

export interface IGeoLocal {
    lat: string,
    lon: string,
    accuracy?: string,
    timestamp: string,
    heading?: string,
    altitude?: string,
    speed?: string,
}