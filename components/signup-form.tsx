'use client';
import Pocketbase from "pocketbase";
import {useState} from "react";


const pb = new Pocketbase('http://127.0.0.1:8090');

export default function SignupForm() {


    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = event.target;

        switch (id) {
            case "username":
                setUsername(value);
                break;
            case "email":
                setEmail(value);
                break;
            case "password":
                setPassword(value);
                break;
            case "confirm_password":
                setConfirmPassword(value);
            break;
        }
    }
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
       
        try{
            const body = {
            "email": email,
            "emailVisibility": false,
            "role": "alumni",
            "avatar": null,
            "username": username,
            "password": password,
            "passwordConfirm": confirmPassword
            };

        const record = await pb.collection('users').create(body);
        console.log('Created successfully:', record);

        }
        catch (error) {
            console.error("Error creating user:", error);
        }
    }

    return (
        <div className= "flex flex-col flex-1 items-center justify-center bg-white font-sans dark:bg-black">
        <h1 className=" text-4xl font-extrabold  sm:text-5xl">Create New User</h1>  

        <form className="flex flex-col gap-4 w-full max-w-md mt-8" onSubmit={handleSubmit}>
            <input
            id="username"
            onChange={handleChange}
            type="text"
            placeholder="Username"
            className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
            id="email"
            onChange={handleChange}
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
            id="password"
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
            id="confirm_password"
            onChange={handleChange}
            type="password"
            placeholder="Confirm Password"
            className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            Sign Up
            </button>
        </form>
        </div>
    );
    }