export default class APIFormat {
  constructor({
    Scenario = "",
    "API URL": url = "",
    "Request Type": requestType = "",
    "Payload Type": payloadType = "",
    "Payload Format": payloadFormat = "",
    Payload: payload = "",
    "Path Variables": pathVariables = "",
    "Request Parameters": requestParameters = "",
    "Dependent On": dependentOn = "",
  } = {}) {
    this.scenario = Scenario;
    this.url = url;
    this.requestType = requestType;
    this.payloadType = payloadType;
    this.payloadFormat = payloadFormat;
    this.payload = payload;
    this.pathVariables = pathVariables;
    this.requestParameters = requestParameters;
    this.dependentOn = dependentOn;
  }

  toString() {
    return `APIFormat{
  scenario='${this.scenario}',
  url='${this.url}',
  requestType='${this.requestType}',
  payloadType='${this.payloadType}',
  payloadFormat='${this.payloadFormat}',
  payload='${this.payload}',
  pathVariables='${this.pathVariables}',
  requestParameters='${this.requestParameters}',
  dependentOn='${this.dependentOn}'
}`;
  }
}
