const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');





const userSchema = new mongoose.Schema({
  //username: { type: String, required: true, unique: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  email: { type: String},
  password: { type: String},
  accounts: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    date_birth: {
        type: Date
    },
    nin: {
        type: String
    },
    
    phone: {
        type: String
    }
    
});


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next(); // Exit early if the password is not modified
    }

    try {

        console.log(this.password)
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        return next(); // Call next() after password hashing is done
    } catch (error) {
        return next(error);
    }
});


userSchema.statics.login = async function(email, password){
    const user = await this.findOne({email});

    if (!user){
        throw new Error('No users found with such credentials')
    } else{
        console.log("Found user")
    }

    
    const isMatch = await bcrypt.compare(password, user.password);

    if(!isMatch){
        throw new Error('Invalid username or password');
    }

    co



    return user;

}





module.exports = mongoose.model('User', userSchema);
