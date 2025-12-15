import {Db, MongoClient} from "mongodb"
import dotenv from "dotenv"


let client:MongoClient
let db: Db

dotenv.config()

//la url se hace asi porque si ponemos la url directamente puede estar indefinida
const MONGO = `mongodb+srv://${process.env.USER_MONGO}:${process.env.USER_PASSWORD}@${process.env.MONGO_CLUSTER}.vbb5s.mongodb.net/?appName=${process.env.MONGO_APP_NAME}`

export const connectmongodb = async (): Promise<void> =>{
    try{
        client = new MongoClient(MONGO)
        await client.connect()
        db = client.db("Personajes")
        console.log("Connected to db")

    }catch (error){
        console.log("Error mongo: "+error)
    }
}

export const getDb = ():Db => db;