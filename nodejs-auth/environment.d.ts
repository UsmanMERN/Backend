declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string;
        }
    }
    namespace Express {
        interface Request {
            user?: any;
            file?: any;
        }
    }
}

// If this file is a module, you need to export something.
export { };