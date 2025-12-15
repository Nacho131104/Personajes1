
import { IResolvers } from "@graphql-tools/utils"




export const resolvers:IResolvers = {

    Query:{
        me: async(_, __,{user})=>{
            if(!user)throw new Error("Debes logearte primero")
        }
    }
}