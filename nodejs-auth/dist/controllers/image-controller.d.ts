import type { Request, Response } from "express";
declare const uplaodImage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getAllImages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { uplaodImage, getAllImages };
//# sourceMappingURL=image-controller.d.ts.map