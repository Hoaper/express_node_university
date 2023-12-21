import mongoose, {Document} from "mongoose";

const userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['staff', 'student', 'teacher', 'guest'],
        required: true,
    },
    issuances: {
        type: [
            {
                book_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'books',
                    required: true,
                },
                due_date: {
                    type: Date,
                    required: true,
                },
            },
        ],
        required: true,
    },
});

const UserModel = mongoose.model('User', userSchema);

userSchema.pre('save', async function (next) {
    console.log("NEW user created");
    next();
})
export default UserModel;
