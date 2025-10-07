declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string;
        }
    }
    namespace Express {
        interface Request {
            user?: any; // Adjust the type as needed
        }
    }
}

// If this file is a module, you need to export something.
export { };