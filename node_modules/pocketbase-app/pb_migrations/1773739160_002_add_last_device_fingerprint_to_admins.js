/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const existing = collection.fields.getByName("last_device_fingerprint");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("last_device_fingerprint"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "last_device_fingerprint"
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("admins");
  collection.fields.removeByName("last_device_fingerprint");
  return app.save(collection);
})