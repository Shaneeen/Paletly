declare module "color-namer" {
    export type Match = { name: string; hex: string; distance: number };
    export type Result = Record<string, Match[]>;
    const namer: (hex: string) => Result;
    export default namer;
  }
  