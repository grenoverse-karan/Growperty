/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("admins");

  const newProviders = [
    {
        "name": "google",
        "clientId": "402625285356-rp6sci9q26n5kl43g2dbj3oigmgmh79q.apps.googleusercontent.com",
        "clientSecret": "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",
        "authURL": "",
        "tokenURL": "",
        "userInfoURL": "",
        "displayName": "",
        "pkce": null
    }
];

  // Upsert: keep providers not in newProviders, then add/replace with newProviders
  collection.oauth2.providers = [
    ...collection.oauth2.providers.filter(p =>
      !newProviders.find(np => np.name === p.name)
    ),
    ...newProviders
  ];
  collection.oauth2.enabled = true;
  collection.oauth2.mappedFields = {
    id: "",
    name: "name",
    username: "",
    avatarURL: "avatar"
  };

  return app.save(collection);
}, (app) => {
  // Rollback: remove the added providers
  const collection = app.findCollectionByNameOrId("admins");
  const providerNamesToRemove = ["google"];
  collection.oauth2.providers = collection.oauth2.providers.filter(p =>
    !providerNamesToRemove.includes(p.name)
  );
  if (collection.oauth2.providers.length === 0) {
    collection.oauth2.enabled = false;
  }
  return app.save(collection);
})