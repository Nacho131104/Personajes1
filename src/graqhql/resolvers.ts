
import { IResolvers } from "@graphql-tools/utils"
import {Character, Show} from "../utils/types"
import {signToken} from "../utils/auth"
import { insertarUsuario,comprobarContraseña } from "../utils/users"
import { getDb } from "../mongo/conexion"
import { comprobarPersonajes } from "../collections/shows"
import { ObjectId } from "mongodb"
import { GraphQLError } from "graphql"

const CollectionUsers = "Usuarios"
const collectionShows= "Shows"
const CollectionCharacters= "Characters"
export const resolvers:IResolvers = {

    Query:{
        me: async(_, __,{user})=>{
            if(!user)throw new Error("Debes logearte primero")
            return user
        },


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
            const promesas = characters.map(async(p)=>{return await comprobarPersonajes(p,title)})
            const characters_comprobados = await Promise.all(promesas)

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
            if(!user)throw new GraphQLError("Primero debes logearte")
            const db = getDb()
            const idc = new ObjectId(idCharacter)
            const ids = new ObjectId(idShow)

            const character_econtrado = await db.collection<Character>(CollectionCharacters).findOne({_id: idc})
            const show_encontrado = await db.collection<Show>(collectionShows).findOne({_id: ids})

            if (!character_econtrado || !show_encontrado) throw new GraphQLError("Algun id de los dos no esta en la db")
            if(character_econtrado.show_name != show_encontrado.title) throw new GraphQLError("Ese personaje no pertence a esa serie")
            await db.collection(collectionShows).updateOne(
                {_id: ids},
                {$addToSet: {characters: new ObjectId(idCharacter)}}
            )
            
            const updateShow = await db.collection(collectionShows).findOne({ _id: show_encontrado._id });
            if (!updateShow) {
                throw new Error("Usuario no encontrado después de actualizar");
            }
            return updateShow;

        }
    },
    Show: {
        characters: async(parent: Show) =>{
            const db = getDb()
            const charactersIds = parent.characters.map((c) => typeof c === "string" ? new ObjectId(c): c )
            if(!charactersIds) return null
            console.log(charactersIds)
            return await db.collection(CollectionCharacters).find({_id: {$in: charactersIds}}).toArray()
        }
    }

}