/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_268752357")

  // add phone field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text_phone_001",
    "max": 0,
    "min": 0,
    "name": "phone",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add personal_email field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text_pemail_002",
    "max": 0,
    "min": 0,
    "name": "personal_email",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add academic_status field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "help": "Year 1, Year 2, Year 3, Year 4, Alumni",
    "hidden": false,
    "id": "text_acadstat_003",
    "max": 0,
    "min": 0,
    "name": "academic_status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add job_title field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "help": "Only for Alumni",
    "hidden": false,
    "id": "text_jobtitle_004",
    "max": 0,
    "min": 0,
    "name": "job_title",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add facebook_url field
  collection.fields.addAt(14, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "url_facebook_005",
    "name": "facebook_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  // add instagram_url field
  collection.fields.addAt(15, new Field({
    "exceptDomains": null,
    "help": "",
    "hidden": false,
    "id": "url_instagram_006",
    "name": "instagram_url",
    "onlyDomains": null,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "url"
  }))

  unmarshal({
    "createRule": "@request.auth.id != '' && user_id = @request.auth.id",
    "updateRule": "@request.auth.id != '' && user_id = @request.auth.id",
    "viewRule": "",
    "listRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_268752357")

  collection.fields.removeById("text_phone_001")
  collection.fields.removeById("text_pemail_002")
  collection.fields.removeById("text_acadstat_003")
  collection.fields.removeById("text_jobtitle_004")
  collection.fields.removeById("url_facebook_005")
  collection.fields.removeById("url_instagram_006")

  unmarshal({
    "updateRule": null,
    "viewRule": null,
    "listRule": null
  }, collection)

  return app.save(collection)
})
