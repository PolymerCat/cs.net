'use client';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import pb from "../functions/client";


export default function SignupForm() {
    const router = useRouter();

    const [login_signup, setLogin_signup] = useState(false); //logout = false, login = true
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => pb.authStore.onChange(() => setIsLoggedIn(pb.authStore.isValid), true), []);


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

    async function handleSignup(e: React.SubmitEvent<HTMLFormElement>) {
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
            router.push("/home");

        }
        catch (error) {
            console.error("Error creating user:", error);
        }
    }

    async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        try{
            const data = {
                "email": email,
                "password": password
            }

            await pb.collection('users').authWithPassword(
                data.email,
                data.password
            );
            console.log('Logged in', data.email);
            router.push("/home");

        } catch (error) {
            console.error("Error logging in:", error);
        }
    }

    return (
        <div className= "flex flex-col flex-1 items-center justify-center bg-white font-sans dark:bg-black">
        {/* <p className="font-extrabold"> Logged In : {isLoggedIn.toString()}</p> */}
        

        {/* Renders different headings based on login/logout state */}
        {login_signup === false?
            <div>
                <h1 className=" text-4xl font-extrabold  sm:text-5xl">Create New User</h1>  
                <form className="flex flex-col gap-4 w-full max-w-md mt-8" onSubmit={handleSignup}>
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
        
        : // OR IF login_signup === "true"--------------------------------------------------

            <div>
                <h1 className=" text-4xl font-extrabold  sm:text-5xl">Log In</h1>
                <form className="flex flex-col gap-4 w-full max-w-md mt-8" onSubmit={handleLogin}>
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
                <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Log In
                </button>

                </form>
            </div>
        
        }
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row mt-4">
            <button onClick={() => setLogin_signup(login_signup => !login_signup)} className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {login_signup === false ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
        </div>
        
        
        

        
        </div>
    );
    }