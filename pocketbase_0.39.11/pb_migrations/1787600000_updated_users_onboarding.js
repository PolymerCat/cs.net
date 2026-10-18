/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add onboarding_complete field
  collection.fields.addAt(9, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1234567890",
    "name": "onboarding_complete",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("bool1234567890")

  return app.save(collection)
})
