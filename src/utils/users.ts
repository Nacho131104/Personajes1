import bcrypt from "bcryptjs";
import { getDb } from "../mongo/conexion";
import { ObjectId } from "mongodb";


export const insertarUsuario =async(email:string,password:string)=>{
    const db=getDb()
    const encriptada = await bcrypt.hash(password,10)

    const result = await db.collection("Usuarios").insertOne({
        email,
        password:encriptada,
        shows: []
    })

    return result.insertedId.toString()
}

export const comprobarContraseña =async (email:string,password:string)=>{
    const db=getDb()
    const usuario =await db.collection("Usuarios").findOne({email})
    if(!usuario){
        return null
    }

    const comparar = await bcrypt.compare(password,usuario.password)

    if(!comparar){
        return null
    }

    return usuario
}

export const filtrarUsuario = async (id: string) => {
    const db = getDb();
    return await db.collection("Usuarios").findOne({_id: new ObjectId(id)})
}