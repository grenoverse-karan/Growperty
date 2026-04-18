/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const existing = collection.fields.getByName("passwordResetExpires");
  if (existing) {
    if (existing.type === "date") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("passwordResetExpires"); // exists with wrong type, remove first
  }

  collection.fields.add(new DateField({
    name: "passwordResetExpires",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.fields.removeByName("passwordResetExpires");
  return app.save(collection);
})