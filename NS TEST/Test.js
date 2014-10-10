/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* @ FILENAME     : 
* @ AUTHOR	     : 
* @ DATE		 : 
*
*
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function onchange(type, name, linenum) {
	var sdate = nlapiGetFieldValue('custpage_sdate');	
	var edate = nlapiGetFieldValue('custpage_edate');	
	var fromorderid = nlapiGetFieldValue('custpage_fromorderid');
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
