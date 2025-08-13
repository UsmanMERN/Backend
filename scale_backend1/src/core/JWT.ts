import { InternalError } from "./CustomError.js";

export class JwtPayload {
    aud: string; sub: string; iss: string; iat: number; exp: number; prm: string;


    constructor(
        issuer: string,
        audience: string,
        subject: string,
        param: string,
        validity: number
    ) {
        this.iss = issuer
        this.aud = audience
        this.sub = subject
        this.prm = param
        this.iat = Math.floor(Date.now() / 1000)
        this.exp = this.iat + validity
    }
}

function encode(pyaload: JwtPayload, secret: string): Promise<string> {
    if (!secret) throw new InternalError("Token generation failure")
    try {

    } catch (error) {

    }

}