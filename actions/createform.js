var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";
var simpledb = require('simpledb');


var task = function(request, callback){
	//1. load configuration
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	console.log( 'attr1 = '+awsConfig.accessKeyId );
	
	var domaind = 'rutkowski';
	var ip = request.ip;
	
	var policyData = helpers.readJSONFile(POLICY_FILE);
	policyData.conditions.push({"x-amz-meta-ip":ip});
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
	
	
	//save in simple db data
	var sdb = new simpledb.SimpleDB({keyid: awsConfig.accessKeyId,secret:awsConfig.secretAccessKey})

	sdb.createDomain( domaind, function( error ) {

	  sdb.putItem(domaind, ip, {attr1: request.ip }, function( error ) {

		sdb.getItem(domaind, ip, function( error, result ) {
		  console.log( 'attr1 = '+result.attr1 )
		})
	  })
	})
	
	
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields, bucket:bucket}});
}

exports.action = task;
