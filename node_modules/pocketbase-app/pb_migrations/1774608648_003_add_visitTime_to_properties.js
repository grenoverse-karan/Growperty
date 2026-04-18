/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("visitTime");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("visitTime"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "visitTime",
    required: false,
    values: ["Working Time (9:00 AM - 7:00 PM)", "Evening (5:00 PM - 9:00 PM)", "Weekend", "Anytime"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("visitTime");
  return app.save(collection);
})