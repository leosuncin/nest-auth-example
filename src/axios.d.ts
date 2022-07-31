// Added to avoid installing axios
// required by @nestjs/terminus
declare module 'axios' {
  export type AxiosError = Error;
}
