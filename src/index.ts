import dotenv from "dotenv"
import { ApolloServer } from "apollo-server";
import { connectmongodb } from "./mongo/conexion"
import {typeDefs} from "./graqhql/schema"
import {resolvers} from "./graqhql/resolvers"
import { getUserFromToken } from "./utils/auth";
dotenv.config()


const app = async () => {
  await connectmongodb();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
        const token = req.headers.authorization || "";
        const user = token ? await getUserFromToken(token as string) : null;
        //devuelve el usuario si hay authorizacion
        return { user };
    },
  }
  );
  await server.listen({ port: 4000 });
  console.log("Inciado server sql");
};



app().catch(err=>console.error(err));