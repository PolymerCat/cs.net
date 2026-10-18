import PocketBase from 'pocketbase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ic = searchParams.get("ic")?.trim();

    if (!ic) {
        return Response.json({ error: "IC number is required" }, { status: 400 });
    }

    try {
        // 1. Initialize a fresh server-side instance
        const pbServer = new PocketBase(process.env.NEXT_PUBLIC_DB_CONNECT);

        // 2. Authenticate as Admin to bypass the locked API rules
        await pbServer.collection('_superusers').authWithPassword(
            process.env.PB_ADMIN_EMAIL!,
            process.env.PB_ADMIN_PASSWORD!
        );

        try {
            // 3. Search the users collection (this will now succeed)
            const record = await pbServer.collection("users").getFirstListItem(`username = "${ic}"`);
            return Response.json({ exists: true, id: record.id });
            
        } catch (err: any) {
            // If the user isn't found, PB throws a 404
            if (err.status === 404) {
                return Response.json({ exists: false });
            }
            throw err; // Re-throw unexpected errors
        }

    } catch (error) {
        console.error("Admin Auth or DB Error:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}