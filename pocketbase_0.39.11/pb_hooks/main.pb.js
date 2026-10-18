// Custom route: Check if an IC number (stored as username) is registered
routerAdd("GET", "/api/check-ic/{ic}", (e) => {
    let ic = e.request.pathValue("ic")

    try {
        let record = $app.findFirstRecordByFilter("users", "username = {:ic}", { ic: ic })
        return e.json(200, { exists: true })
    } catch (err) {
        return e.json(200, { exists: false })
    }
})

// After user creation, auto-create a profile record
onRecordAfterCreateSuccess((e) => {
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
    profile.set("phone", null);
    profile.set("personal_email", null);
    profile.set("academic_status", null);
    profile.set("job_title", null);
    profile.set("facebook_url", null);
    profile.set("instagram_url", null);

    $app.save(profile);
    e.next();
}, "users")