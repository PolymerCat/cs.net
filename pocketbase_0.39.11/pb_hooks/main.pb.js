
routerAdd("GET", "/hello/{name}", (e) => {
    let name = e.request.pathValue("name")

    return e.json(200, { "message": "Hello " + name })
})

onRecordAfterCreateSuccess( (e) => {
    
        const profileCollection = $app.findCollectionByNameOrId("profile");
        const profile = new Record(profileCollection);

        profile.set("user_id", e.record.id);
        profile.set("full_name", null);
        profile.set("program", null);
        profile.set("grad_year", null);
        profile.set("bio", null);
        profile.set("industry", null);
        profile.set("interests", null);
        profile.set("linkedin_url", null);
        profile.set("portfolio_url", null);
        profile.set("matric_number", null);

        $app.save(profile);
        e.next();
        // alert("User and Profile created successfully!" + e.record.email);

    e.next()
}, "users",)