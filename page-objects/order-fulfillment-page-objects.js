export class orderFulfillmentPageObjects {
    sidebarOption_search = '//ul[@role="menubar"]//li[contains(@class, "menu-item menu-item-enabled") and .//span[@class="menu-item-title" and normalize-space(text())="Search"]]';
    container_iframe_search = '//div[@data-portalharnessinsname="Data-Portal!pyCaseWorker"]//main';
    iframe_searchpage = '//iframe[@title="Search"]';
    iframe_searchpage_identifier = 'PegaGadget3Ifr';
    textbox_caseId = '//input[@name="$PpyDisplayHarness$pSearchCaseID"]';
    button_open = '//button[@name="OFCustomSearch_pyDisplayHarness_12"]';
    
    title_orderFulfillment = "//div[normalize-space(text())='Order Fulfillment']";
    textbox_search = "//input[@title='Enter text to search']";
    button_search = "//i[@title='Search' and @aria-label='Search']";
    text_caseType = "//table[@class='gridTable ']//tr[contains(@class,'cellCont')]/td[2]/div//div[contains(normalize-space(text()),'Order Fulfillment')]"; // also to count the number of data rows returned
    text_group = "//table[@class='gridTable ']//tr[contains(@class,'cellCont')]/td[2]/div//div[contains(normalize-space(text()),'Group')]";
    text_orderId = "//table[@class='gridTable ']//tr[contains(@class,'cellCont')]/td[5]/div//a[normalize-space(text())='O-272757']" // also to count the number of duplicate orderId's (if any)
    title_orderLinks = "//div[normalize-space(text())='Order Lines']";
    // check that tab name is Order Fulfillment - {OrderID}
    // text_groupId = "(//div[@id='CT' and normalize-space(@style)='']//div[contains(@class, 'dataValueRead')]//span[contains(text(), '(G-')])[1]";
    text_groupId = "(//div[@id='CT']//span[contains(text(), 'G-')])[1]";
    button_open = "(//div[@id='CT' and not(contains(@style,'display:none'))]//a[normalize-space(text())='Open'])[1]";
    text_Search = "(//table[@id='bodyTbl_gbl']//ul[@class='gridNode']//li//div[@id='CT' and contains(@class,'content-item') and @style=' ']//span[text()='Search' and @class='standard_wrap'])[1]";
    text_Results = "(//table[@id='bodyTbl_gbl']//ul[@class='gridNode']//li//div[@id='CT' and contains(@class,'content-item') and @style=' ']//span[text()='Results' and @class='standard_wrap'])[1]";
    button_begin = "(//button[@data-ctl='Button' and normalize-space()='Begin'])[2]";
    button_cancel = "//button[@title='Cancel']";
    text_completeSearch = "//div[@section_index='1']//div[normalize-space(text())='Complete Search']";
    button_yes = "//button[@value='true' and normalize-space()='Yes']";
    button_no = "//button[@value='false' and normalize-space()='No']"
    option_Refresh = "//ul[@aria-label='Actions']//li[@title='Refresh this work item' and normalize-space()='Refresh']//a";
    button_anytimeActions = '//button[normalize-space()="Anytime Actions" and @title="Actions" and @aria-haspopup="true"]';
}
