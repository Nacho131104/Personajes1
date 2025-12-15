
import { IResolvers } from "@graphql-tools/utils"

import {signToken} from "../utils/auth"
import { insertarUsuario,comprobarContraseña } from "../utils/users"
import { getDb } from "../mongo/conexion"

const CollectionUsers = "Usuarios"
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
            const insertado = await db.collection(CollectionUsers).insertOne({
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

        insertShow: async(_,{title,episodes,characters}) =>{

        }

    }
}