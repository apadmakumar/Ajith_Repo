/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME     : Test.js
* @ AUTHOR	     : Unitha.Rangam
* @ DATE		 : 13th Oct 2014
*
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function onchange(type, name, linenum) {
	var sdate = nlapiGetFieldValue('trandate');	
	var edate = nlapiGetFieldValue('enddate');	
	var toorderid= nlapiGetFieldValue('custpage_toorderid');
	var customer= nlapiGetFieldValue('custpage_customer');	
	var committed = nlapiGetFieldValue('custpage_committed');	
	var location = nlapiGetFieldValue('custpage_location');
	if(!sdate) {
		alert('Please enter start date');
		return false;
	}
	else if(!edate) {
		alert('Please enter end date');
		return false;
	}
}
