import{gql} from "apollo-server"


export const typeDefs = gql `
    type Character {
        _id: ID!
        name: String!
        gender: String!
        age: Int!
        show_name: String!
    }
    
    type Show {
        _id: ID!
        title: String!
        episodes: Int!
        characters: [Character]!
    }

    type User {
        _id: ID!
        email: String!
        shows: [Show]!
    }

    type Query {
        me:User
        getCharacter(id: String!): Character
    }

    type Mutation {

        register(email: String!, password: String!) : String!
        login(email: String!, password: String!) : String!
        insertShow(title: String!, episodes: Int!, characters: [String]!): Show!
        insertCharacter(name: String!, gender: String!, age: Int!, show_name: String!): Character!
        insertCharacterInaShow(idCharacter: String!, idShow: String!): Show!
        insertShowInUser(idShow: String!): User!
    }







`