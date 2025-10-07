import type { Response, Request } from "express";
declare const registerUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { registerUser, loginUser };
//# sourceMappingURL=auth-controller.d.ts.map