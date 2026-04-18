/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const existing = collection.fields.getByName("ageOfProperty");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("ageOfProperty"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "ageOfProperty",
    required: false,
    values: ["0-1 Year", "1-5 Years", "5-10 Years", "10+ Years"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  collection.fields.removeByName("ageOfProperty");
  return app.save(collection);
})