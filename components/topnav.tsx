
export default function TopNav() {

    return (
        <header className="sticky top-0 z-50 bg-orange-400 backdrop-blur-md ">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <span className="text-3xl font-bold tracking-tight text-black">CS.NET</span>
                <nav className="hidden md:flex space-x-8 text-sm font-medium text-black">
                    <a href="#home" className="hover:text-indigo-600 transition">Alumni</a>
                    <a href="#home" className="hover:text-indigo-600 transition">Companies</a>
                    <a href="#home" className="hover:text-indigo-600 transition">Development</a>
                </nav>
                <div className="flex items-center space-x-4">
                    {/* <button className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</button> */}
                    <button className="bg-black text-orange-400 text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                    Logout
                    </button>
                </div>
                </div>
        </header>
    );

}
