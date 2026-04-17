/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  const newProviders = [
    {
        "name": "google",
        "clientId": "YOUR_GOOGLE_CLIENT_ID",
        "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET",
        "authURL": "",
        "tokenURL": "",
        "userInfoURL": "",
        "displayName": "",
        "pkce": null
    },
    {
        "name": "facebook",
        "clientId": "YOUR_FACEBOOK_APP_ID",
        "clientSecret": "YOUR_FACEBOOK_APP_SECRET",
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
  const collection = app.findCollectionByNameOrId("users");
  const providerNamesToRemove = ["google", "facebook"];
  collection.oauth2.providers = collection.oauth2.providers.filter(p =>
    !providerNamesToRemove.includes(p.name)
  );
  if (collection.oauth2.providers.length === 0) {
    collection.oauth2.enabled = false;
  }
  return app.save(collection);
})