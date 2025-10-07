declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MONGO_URI: string;
        }
    }
}

// If this file is a module, you need to export something.
export { };