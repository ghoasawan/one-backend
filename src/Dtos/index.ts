export interface TokenPayloadDto  {
    userId?:string;
    email?: string;
  }

export interface UserDto{
  // id?:string,
  name?:string,
  email:string,
  password:string,
  phone?:string
}