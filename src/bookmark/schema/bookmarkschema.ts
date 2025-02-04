import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";
import mongoose from 'mongoose';
import { User } from "src/user/schema/user.chema";

@Schema()
export class Bookmark{
    @Prop({type: SchemaTypes.ObjectId, auto:true} )
    _id: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    userId: User;

    @Prop({ required: true, type: String })
    algorithmName: string;

    @Prop({ required: true, type: String })
    bookmarkName: string;

    @Prop({ type: SchemaTypes.Mixed, default: {} })
    parameterPreset: Record<string, any>;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;
}  

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);


BookmarkSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
