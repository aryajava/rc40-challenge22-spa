import { ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

export default class Todo {
    constructor(title, complete, deadline, executor) {
        this.title = title;
        this.complete = complete || false;
        this.deadline = deadline || new Date();
        this.executor = new ObjectId(executor);
    }

    static validate(todoData) {
        if (!todoData.title || typeof todoData.title !== "string") {
            throw new Error("Title is required and must be a string.");
        }
        if (typeof todoData.complete !== "boolean") {
            throw new Error("Complete must be a boolean.");
        }
        if (!todoData.deadline || !(todoData.deadline instanceof Date)) {
            throw new Error("Deadline must be a valid Date.");
        }
        if (!todoData.executor || !ObjectId.isValid(todoData.executor)) {
            throw new Error("Executor must be a valid ObjectId.");
        }
        return true;
    }

    static async getAll(db, query = {}, sort = {}, offset = 0, limit = 0) {
        const todosCollection = db.collection(process.env.TODOS_COLLECTION);
        if (limit === 0) {
            return await todosCollection.find(query).sort(sort).toArray();
        } else {
            return await todosCollection.find(query).sort(sort).skip(offset).limit(limit).toArray();
        }
    }

    static async getCount(db, query = {}) {
        const todosCollection = db.collection(process.env.TODOS_COLLECTION);
        return await todosCollection.countDocuments(query);
    }

    static async getById(db, userId, todoId) {
        const todosCollection = db.collection(process.env.TODOS_COLLECTION);
        const todo = await todosCollection.findOne({ _id: new ObjectId(todoId), executor: new ObjectId(userId) });
        return todo;
    }

    static async save(db, todoData) {
        this.validate(todoData);
        const todosCollection = db.collection(process.env.TODOS_COLLECTION);
        const result = await todosCollection.insertOne(todoData);
        return result;
    }

    static async update(db, userId, todoId, todoData) {
        this.validate(todoData);
        const todosCollection = db.collection(process.env.TODOS_COLLECTION);
        const result = await todosCollection.updateOne({ _id: new ObjectId(todoId), executor: new ObjectId(userId) }, { $set: todoData });
        return result;
    }

    static async delete(db, userId, todoId) {
        const todosCollection = db.collection(process.env.TODOS_COLLECTION);
        const result = await todosCollection.deleteOne({ _id: new ObjectId(todoId), executor: new ObjectId(userId) });
        return result;
    }
}