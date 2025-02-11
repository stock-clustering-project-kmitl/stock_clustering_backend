import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";

@Schema()
export class User{
    @Prop({type: SchemaTypes.ObjectId, auto:true} )
    _id: Types.ObjectId;

    @Prop()
    username: string;

    @Prop({ unique: true })
    //should check if its a valid email
    email: string;

    @Prop()
    password: string;

    @Prop({ type: [SchemaTypes.ObjectId], ref: 'Bookmark' })
    bookmarks: Types.ObjectId[];

    @Prop({
        type: [String],
        set: (favorites: string[]) => Array.from(new Set(favorites)), 
    })
    favorite: string[];

}  

export const UserSchema = SchemaFactory.createForClass(User);
