
import TopNav from "@/components/topnav";
import ProtectedPage from "@/components/protected-page";


export default function ProfilePage() {



    return (
        <ProtectedPage>
            <TopNav />
            <div className="flex flex-col items-center justify-center min-h-screen py-2">

            </div>
        </ProtectedPage>
    )




}