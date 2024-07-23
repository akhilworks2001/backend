import mongoose, {Schema} from "mongoose";

const subciptionSchema = new Schema (
    {
        subscriber: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, // one to whom 'subscrber' is subscribing 
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

export const Subciption = mongoose.model("Subciption", subciptionSchema)