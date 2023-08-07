import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true
    },
    postId: {
        type: String,
        require: true
    },
    description: {
        type: String,
        maxlength: 300
    },
    likes: {
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

const commentModel = mongoose.model('comment', commentSchema);

export default commentModel;