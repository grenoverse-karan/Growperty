/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const propertyType = e.record.get("propertyType") || "";
  const city = e.record.get("city") || "";
  const expectedPrice = e.record.get("expectedPrice") || 0;
  const propertyTitle = e.record.get("title") || "New Property";
  const propertyId = e.record.id;

  // Find all active buyer requirements
  const buyerRequirements = $app.findAllRecords("buyer_requirements", {
    filter: "status = 'active'"
  });

  const matches = [];

  // Check each buyer requirement for a match
  for (const requirement of buyerRequirements) {
    const reqPropertyType = requirement.get("propertyType") || "";
    const reqCity = requirement.get("city") || "";
    const minPrice = requirement.get("minPrice") || 0;
    const maxPrice = requirement.get("maxPrice") || 0;

    // Match criteria: property type, city, and price within range
    if (reqPropertyType === propertyType && 
        reqCity === city && 
        expectedPrice >= minPrice && 
        expectedPrice <= maxPrice) {
      matches.push({
        buyerName: requirement.get("buyerName") || "Unknown",
        buyerEmail: requirement.get("buyerEmail") || "N/A",
        buyerPhone: requirement.get("buyerPhone") || "N/A",
        minPrice: minPrice,
        maxPrice: maxPrice,
        bhk: requirement.get("bhk") || "Any",
        minArea: requirement.get("minArea") || "Any",
        maxArea: requirement.get("maxArea") || "Any",
        areaUnit: requirement.get("areaUnit") || "sqft",
        sector: requirement.get("sector") || "Any",
        society: requirement.get("society") || "Any",
        specialRequirements: requirement.get("specialRequirements") || "None"
      });
    }
  }

  // If matches found, send notification to admin
  if (matches.length > 0) {
    let matchesHtml = "";
    for (const match of matches) {
      matchesHtml += "<div style='border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px;'>" +
                     "<p><strong>Buyer Name:</strong> " + match.buyerName + "</p>" +
                     "<p><strong>Email:</strong> " + match.buyerEmail + "</p>" +
                     "<p><strong>Phone:</strong> " + match.buyerPhone + "</p>" +
                     "<p><strong>Budget Range:</strong> ₹" + match.minPrice + " - ₹" + match.maxPrice + "</p>" +
                     "<p><strong>Requirements:</strong></p>" +
                     "<ul>" +
                     "<li>BHK: " + match.bhk + "</li>" +
                     "<li>Area: " + match.minArea + " - " + match.maxArea + " " + match.areaUnit + "</li>" +
                     "<li>Sector: " + match.sector + "</li>" +
                     "<li>Society: " + match.society + "</li>" +
                     "<li>Special Requirements: " + match.specialRequirements + "</li>" +
                     "</ul>" +
                     "</div>";
    }

    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName
      },
      to: [{ address: "admin@site.com" }],
      subject: "New Property Matches Buyer Requirement - " + propertyTitle,
      html: "<h2>Property Match Alert</h2>" +
            "<p><strong>Property:</strong> " + propertyTitle + " (ID: " + propertyId + ")</p>" +
            "<p><strong>Type:</strong> " + propertyType + "</p>" +
            "<p><strong>City:</strong> " + city + "</p>" +
            "<p><strong>Price:</strong> ₹" + expectedPrice + "</p>" +
            "<h3>Matching Buyer Requirements (" + matches.length + " found)</h3>" +
            matchesHtml +
            "<p><em>Review these matches and contact the buyers if interested.</em></p>"
    });
    $app.newMailClient().send(message);
  }

  e.next();
}, "properties");