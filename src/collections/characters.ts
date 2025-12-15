import { ObjectId } from "mongodb";
import { Character } from "../utils/types";
import { getDb } from "../mongo/conexion";


const CharacterCollection = "Characters"
export const getCharacter = async(id: string): Promise<Character> =>{
    const db = getDb()
    const personaje = await db.collection<Character>(CharacterCollection).findOne({_id: new ObjectId(id)})
    if(!personaje) throw new Error("Personaje no encontrado")
    
    return personaje
}

export const getCharacters = async( page?: number, size ?: number): Promise<Character[]> =>{
    const db = getDb()
    page = page || 1
    size = size || 3

    // la formula es que si quieres 3 objetos de la pagina 1, simplemente obtendra hasta el limit y asi con cualquier ejemplo.
    return await db.collection<Character>(CharacterCollection).find().skip((page - 1) * size).limit(size).toArray();
}