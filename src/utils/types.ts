import { ObjectId } from "mongodb";




export type User={
    _id:ObjectId,
    email:string,
    shows: string[]
}

export type TokenPayload = {
    userId: string;
}

export type Character ={
    _id: ObjectId,
    name: string,
    gender: string,
    age: number,
    show_name: string
}

export type Show ={
    _id: ObjectId,
    title: string,
    episodes: number,
    characters: string[]
}