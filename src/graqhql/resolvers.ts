
import { IResolvers } from "@graphql-tools/utils"
import {Character, Show, User} from "../utils/types"
import {signToken} from "../utils/auth"
import { insertarUsuario,comprobarContraseña } from "../utils/users"
import { getDb } from "../mongo/conexion"
import { comprobarPersonajes } from "../collections/shows"
import { ObjectId } from "mongodb"
import { GraphQLError } from "graphql"
import { getCharacter } from "../collections/characters"
const CollectionUsers = "Usuarios"
const collectionShows= "Shows"
const CollectionCharacters= "Characters"
export const resolvers:IResolvers = {

    Query:{
        me: async(_, __,{user})=>{

            //si no se devolvio el usuario en el context es que la autorizacion falta.
            if(!user)throw new Error("Debes logearte primero")
            return user
        },
        getCharacter: async(_,{id}) =>{
            const personaje= await getCharacter(id)
            return personaje
        },
        getCharacters:async(_,{p, s})=>{
            const page = p || 1
            const size = s || 3
        }


    },
    Mutation:{
        register: async (_, {  email, password }) => {
            const userId = await insertarUsuario(email, password);
            return signToken(userId)
        },

        login: async (_, { email, password }) => {
            const user = await comprobarContraseña(email, password);
            if (!user) {
                throw new Error("Credenciales incorrectas");
            }
            return signToken(user._id.toString())
        },
        insertCharacter:async(_, {name,gender, age, show_name})=>{
            const db = getDb()
            const insertado = await db.collection(CollectionCharacters).insertOne({
                name,
                age,
                gender,
                show_name
            })
            if(!insertado) return null
            return {
                _id: insertado.insertedId,
                name,
                age,
                gender,
                show_name
            }
        },

        insertShow: async(_,{title,episodes,characters}:{title:string, episodes: number,characters:string[]}) =>{
            const db = getDb()

            //se llama a una funcion que comprueba que los personajes estan introducidos en la bd devolviendo un array de promesas de objectId
            const promesas = characters.map(async(p)=>{return await comprobarPersonajes(p,title)})
            const characters_comprobados = await Promise.all(promesas)

            //si estan bien se inserta el nuevo show
            const insertado = await db.collection(collectionShows).insertOne({
                title,
                episodes,
                characters: characters_comprobados
            })
            console.log(characters_comprobados)
            return {
                _id: insertado.insertedId,
                title,
                episodes,
                characters:characters_comprobados
            }
        },
        insertCharacterInaShow: async (_,{idCharacter, idShow},{user})=>{

            // si no esta logeado no se podra actualizar un show con un nuevo  personaje
            if(!user)throw new GraphQLError("Primero debes logearte")
            const db = getDb()


            const idc = new ObjectId(idCharacter)
            const ids = new ObjectId(idShow)


            //se buscan el show a modificar y el personaje a introducir, si no se encuentran en la bd no se puede seguir
            const character_econtrado = await db.collection<Character>(CollectionCharacters).findOne({_id: idc})
            const show_encontrado = await db.collection<Show>(collectionShows).findOne({_id: ids})

            if (!character_econtrado || !show_encontrado) throw new GraphQLError("Algun id de los dos no esta en la db")
            
            // cada personaje tiene un show correspondiente, si el show de un personaje a introducir en un show no coincide no se podra introducir
            if(character_econtrado.show_name != show_encontrado.title) throw new GraphQLError("Ese personaje no pertence a esa serie")

            // se modifica el array de ids de caracteres del show, añadiendo el del nuevo personaje
            await db.collection(collectionShows).updateOne(
                {_id: ids},
                {$addToSet: {characters: new ObjectId(idCharacter)}}
            )
            
            // finalmente se comprueba que se ha actualizado  y se continua
            const updateShow = await db.collection(collectionShows).findOne({ _id: show_encontrado._id });
            if (!updateShow) {
                throw new Error("Usuario no encontrado después de actualizar");
            }
            return updateShow;

        },
        
        insertShowInUser: async (_,{idShow},{user})=>{
            const db = getDb()
            //en caso de que se haya logeado el usuario, se obtiene su id del context para modificarlo
            if(!user) throw new GraphQLError("Debe de logearse primero")
            const userId = user._id
            console.log(userId)

            //se confirma que el id del show existe en la db
            const show = await db.collection<Show>(collectionShows).findOne({_id: new ObjectId(idShow)})
            if(!show) return null

            await db.collection<User>(CollectionUsers).updateOne(
                {_id: userId},
                {$addToSet:{shows: idShow}}
            )
            const modificado = await db.collection<User>(CollectionUsers).findOne({_id: userId})
            if(!modificado) return null
            return {
                _id: modificado._id,
                email: modificado.email,
                shows: modificado.shows
            }
        }
    },
    Show: {
        characters: async(parent: Show) =>{
            const db = getDb()

            //en caso de que el array de personajes del show sea de strings, se cambiaran a objectsId
            const charactersIds = parent.characters.map((c) => typeof c === "string" ? new ObjectId(c): c )
            if(!charactersIds) return null
            console.log(charactersIds)

            //se retorna el array de objetos Character en caso de que su id este dentro del array de ids obtenido antes
            return await db.collection(CollectionCharacters).find({_id: {$in: charactersIds}}).toArray()
        }
    },
    User : {
        shows:async(parent: User) =>{
            const db = getDb()

                        //en caso de que el array de personajes del show sea de strings, se cambiaran a objectsId
            const ShowsIds = parent.shows.map((c) => typeof c === "string" ? new ObjectId(c): c )
            if(!ShowsIds) return null
            console.log(ShowsIds)

            //se retorna el array de objetos Character en caso de que su id este dentro del array de ids obtenido antes
            return await db.collection(collectionShows).find({_id: {$in: ShowsIds}}).toArray()

        }
    }

}