/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const existing = collection.fields.getByName("passwordResetToken");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("passwordResetToken"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "passwordResetToken",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.fields.removeByName("passwordResetToken");
  return app.save(collection);
})