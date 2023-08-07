import mongoose from "mongoose";
import Joi from "joi";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'please enter an email'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (value) {
              return Joi.string().email().validate(value).error === undefined;
            },
            message: 'please enter a valid email.'
          }
    },
    password: {
        type: String,
        require: [true, 'please enter an password'],
        minlength: [6, 'Min password length is 6 characters']
    },
    userName: {
        type: String,
        required: [true, 'please enter an username'],
        unique: true
    },
    profilePicture: {
        type: String,
        default: ""
    },
    followers: {
        type: Array,
        default:[]
    },
    following: {
        type: Array,
        default: []
    },
    likedPosts: {
        type: Array,
        default: []
    },
    likedComments:{
        type: Array,
        default:[]
    },
    comments:{
        type: Array,
        default:[]
    },  
    isAdmin:{
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        maxlength: 250
    },
    city: {
        type: String,
        maxlength: 50
    },
    from: {
        type: String,
        maxlength: 50
    }
},
{timestamps: true}
);

// fire a function before doc saved to db
userSchema.pre('save', async function (next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// static method to login user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect email or password');
    }
    throw Error('incorrect email or password')
}
 
const userModel = mongoose.model('user', userSchema);

export default userModel;