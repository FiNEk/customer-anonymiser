declare namespace NodeJS {
  interface ProcessEnv {
    DB_URI: string;
    DB_NAME?: string;
  }
}
