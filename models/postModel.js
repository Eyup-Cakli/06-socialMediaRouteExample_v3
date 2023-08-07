import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    image:{
        type: String
    },
    likes: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
{timestamps: true}
);

const postModel = mongoose.model('post', postSchema);

export default postModel;