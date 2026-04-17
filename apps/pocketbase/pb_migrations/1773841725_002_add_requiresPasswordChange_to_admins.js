/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const existing = collection.fields.getByName("requiresPasswordChange");
  if (existing) {
    if (existing.type === "bool") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("requiresPasswordChange"); // exists with wrong type, remove first
  }

  collection.fields.add(new BoolField({
    name: "requiresPasswordChange",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.fields.removeByName("requiresPasswordChange");
  return app.save(collection);
})