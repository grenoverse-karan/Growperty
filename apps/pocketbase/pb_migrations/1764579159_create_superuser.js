/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const superusers = app.findCollectionByNameOrId("_superusers")
    const record = new Record(superusers)
    
    record.set("email", "admin@growperty.com")
    record.set("password", "Growperty@2024")
    
    app.save(record)
})
