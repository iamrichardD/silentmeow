export type ConfigurationRecord = {
  [key: string]: string | number | boolean | ConfigurationRecord | undefined;
};

export interface ConfigurationManager {
  get<T extends string | number | boolean | ConfigurationRecord>(
    key: string,
    defaultValue?: T
  ): T;
  load(): Promise<void>;
}
