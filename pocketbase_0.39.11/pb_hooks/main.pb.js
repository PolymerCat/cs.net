
routerAdd("GET", "/hello/{name}", (e) => {
    let name = e.request.pathValue("name")

    return e.json(200, { "message": "Hello " + name })
})

onRecordAfterCreateSuccess((e) => {
    const profileCollection = $app.findCollectionByNameOrId("profile");
    const profile = new Record(profileCollection);

    profile.set("user_id", e.record.id);

    $app.save(profile);
    e.next();
}, "users");