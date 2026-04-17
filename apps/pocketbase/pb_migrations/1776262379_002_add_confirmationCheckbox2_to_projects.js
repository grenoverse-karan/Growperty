/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("projects");

  const existing = collection.fields.getByName("confirmationCheckbox2");
  if (existing) {
    if (existing.type === "bool") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("confirmationCheckbox2"); // exists with wrong type, remove first
  }

  collection.fields.add(new BoolField({
    name: "confirmationCheckbox2",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("projects");
    collection.fields.removeByName("confirmationCheckbox2");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
