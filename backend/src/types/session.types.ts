import { Types , Document} from "mongoose";


export interface ISession{
    user: Types.ObjectId
    refreshToken: string,
    userAgent?: string 
    ip?:string
    expiresAt:Date

}

export interface ISessionDocument extends ISession, Document {
   _id: Types.ObjectId
   createdAt: Date
   updatedAt: Date

} 