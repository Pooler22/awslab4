var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";


var task = function(request, callback){
	//1. load configuration
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);
	policyData.conditions.push({"x-amz-meta-ip":request.ip});
	policyData.conditions.push({"x-amz-meta-name":"pawel"});
	policyData.conditions.push({"x-amz-meta-surname":"rutkowski"});

	//2. prepare policy
	var policy = new Policy(policyData);
	policy.generateEncodedPolicyDocument();

	//3. generate form fields for S3 POST
	var s3Form = new S3Form(policy);
	//4. get bucket name
	var fields = s3Form.generateS3FormFields();

	var fieldsAll = s3Form.addS3CredientalsFields(fields,awsConfig);
	
	var bucket = policyData.conditions[1].bucket;
		
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields, bucket:bucket}});
}

exports.action = task;
