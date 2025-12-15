import { GraphQLError } from "graphql/error"
import { getDb } from "../mongo/conexion"
import { Character } from "../utils/types"
import { ObjectId } from "mongodb"
const coleccionPersonajes = "Characters"
export const comprobarPersonajes = async(n: string ,show: string): Promise<ObjectId>=>{

    const db = getDb()
    const personaje = await db.collection<Character>(coleccionPersonajes).findOne({name: n})
    console.log(personaje)
    if(!personaje) throw new GraphQLError("El personaje que has introducido es no encontrado")
    if(personaje.show_name != show) throw  new GraphQLError("ese personaje no pertenece a esa serie")
    console.log(personaje._id.toString())
    return personaje._id
}