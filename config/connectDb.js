import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_CONNECT_STRING);
        console.log('Connected to mongoDB')
    } catch (error) {
        console.log('couldnt connect to mongoDB', error)
    }
};

export default  connectDb;