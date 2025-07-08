export class PassportRegistrationPageObjects {
    section_details = "//div[@aria-label=\"Details\"]/h3[.//text()[contains(., \"Details\")]]";
    dataRow_selectPassportType = "//div[@aria-label=\"Details\" and contains(@class, \"header\")]/following-sibling::div[contains(@class, \"layout-body\")]//div[@class=\"content-item content-field item-1 remove-left-spacing remove-right-spacing flex\"][.//span[text()=\"Select Type Of Passport\"]]";
}	