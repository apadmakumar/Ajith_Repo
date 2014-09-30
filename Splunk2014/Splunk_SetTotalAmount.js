/*
* User script to set Total Amount on Salesorder line items.
* @ AUTHOR : Abith Nitin
* @Release Date 15th Sep 2014
* @Release Number 
* @version 1.0
 */
  //Function is used in User event script to calculate Total Amt Field as qty*unitcost and keeping the Unit Cost field as constant even on change of terms in months on beforesubmit of SO
 function setTotalAmtAfterSubmit(type)
 {
	try{
		var recType = nlapiGetRecordType();		
		var recId = nlapiGetRecordId();
		//Update Price on Quote record line items getting from Rate column
		if(recType == 'estimate'){
			if (type == 'create' ||  type == 'edit') {
				//var qrec = nlapiLoadRecord(recType, recId);
				var qlinecount = nlapiGetLineItemCount('item');
				for (var j = 1; j <= qlinecount; j++) {
					var rate = nlapiGetLineItemValue('item', 'rate', j);
					if (rate) {
						nlapiSetLineItemValue('item', 'custcol_price', j, rate);
					}
				}
				//var qid = nlapiSubmitRecord(qrec, true);
				//nlapiLogExecution('DEBUG', 'quote Submitted', qid);
			}
		}
		//Update Total Amount,Unit Cost,Old Unit Cost and Old Total Amount columns of SO line items, getting from Quote record line items Rate column
		if(recType == 'salesorder' || recType == 'invoice'){
			if (type == 'create' || type == 'edit') {
				nlapiLogExecution('DEBUG','type in 1st loop',type);
				var totalamt = 0;
				var unitCost = 0;
				var quoteid = '';
				var sorec = nlapiLoadRecord(recType, recId);
				//if(type == 'create') {
					quoteid = sorec.getFieldValue('createdfrom');
					sorec.setFieldValue('custbody_quoteid',quoteid);
				//}
				var quoteInfo = sorec.getFieldValue('createdfrom');
				if(!quoteInfo) { 
					quoteid = sorec.getFieldValue('custbody_quoteid'); 
				}
				else {
					quoteid = quoteInfo;
				}
				if (quoteid){
					var status = sorec.getFieldValue('status');
					nlapiLogExecution('DEBUG','status',status);
					if(recType == 'salesorder') {
						if(status && status != 'Pending Approval' && status!= 'Pending Billing') {
							return;
						}
						//Check for SO record billed or partially billed in terms of Invoice so that SO Amount is not updated for Billed orders
						if(type == 'edit') {
							var filters = new Array();
							var columns = new Array();
							filters.push(new nlobjSearchFilter('createdfrom', null, 'is', quoteid, null));
							filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T', null));
							columns[0] = new nlobjSearchColumn('internalid');
							var searchresults = nlapiSearchRecord('invoice', null, filters, columns);
							if(searchresults) {
								nlapiLogExecution('DEBUG','searchresults',searchresults.length);
								return;
							}
						}
					}
					
					var quoterec = '';
					//In order to load the record from the field 'created from'(Newly added)
					if(recType == 'salesorder')
					{
						quoterec = nlapiLoadRecord('estimate', quoteid);
					}
					if(recType == 'invoice')
					{
						quoterec = nlapiLoadRecord('salesorder', quoteid);
					}
					// get quote line items price check for same lines available on SO lines to update price
					//var quoterec = nlapiLoadRecord('estimate', quoteid);
					var linecount = quoterec.getLineItemCount('item');
					var totalamt = 0;
					var unitCost = 0;
					for(var a = 1; a <= linecount; a++){
						var linenum = quoterec.getLineItemValue('item','line',a);
						var unitCost = quoterec.getLineItemValue('item','rate',a);
						var Qitem = quoterec.getLineItemValue('item','item',a);
						var qty = quoterec.getLineItemValue('item','quantity',a);
						Qtotalamt = parseFloat(totalamt + parseFloat(qty * unitCost));
						nlapiLogExecution('DEBUG', 'Quote a '+a,  'linenum '+linenum+' unitCost '+unitCost+ ' Qtotalamt '+Qtotalamt);
						
						var soline = sorec.findLineItemValue('item','line',linenum);
						var lineitemcount = sorec.getLineItemCount('item');
						nlapiLogExecution('DEBUG', 'soline '+soline, ' lineitemcount '+lineitemcount);
						for(var b = a; b <= lineitemcount; b++){
							var lineno = sorec.getLineItemValue('item','line',b);
							var SOitem = sorec.getLineItemValue('item','item',b);
							nlapiLogExecution('DEBUG', 'b '+b, ' a '+a+ ' lineno '+lineno+ ' SOitem '+SOitem+ ' linenum '+linenum+ ' Qitem '+Qitem);
							//if both the lines and Items of quote and SO matchs then only update respective amounts considering override concept
							if((linenum == lineno) && (Qitem == SOitem)) {
								var isoverride = sorec.getLineItemValue('item', 'custcol_overridetotalamount', b);
								var unitCostisoverride = sorec.getLineItemValue('item', 'custcol_spk_overrideunitcost', b);
								nlapiLogExecution('DEBUG', 'soline '+soline, ' Invoice isoverride'+isoverride);
								if (isoverride != 'T' && unitCostisoverride != 'T' ) {
									nlapiLogExecution('DEBUG', 'isoverride != T', 'unitCostisoverride!= T');
									sorec.setLineItemValue('item','custcol_price',b,unitCost); // Price
									sorec.setLineItemValue('item','custcol_spk_unitcost',b,unitCost); // Unit Cost(Custom Field)
									nlapiLogExecution('DEBUG', 'unitCost', unitCost);
									sorec.setLineItemValue('item', 'rate', b, unitCost); // Old Unit Cost(Standard Field)
									var quantity = sorec.getLineItemValue('item', 'quantity', b);
									var amt = parseFloat(quantity * unitCost);
									sorec.setLineItemValue('item','custcol_totalamount',b,amt);
									sorec.setLineItemValue('item','amount',b,amt);
									//break;
								}
								if(isoverride == 'T' && unitCostisoverride == 'T' ) {
									nlapiLogExecution('DEBUG', 'isoverride == T', 'unitCostisoverride == T');
									var uCost = sorec.getLineItemValue('item', 'custcol_spk_unitcost', b);
									if(!uCost) { uCost = 0; }
									nlapiLogExecution('DEBUG', 'uCost ', uCost);
									sorec.setLineItemValue('item', 'rate', b, uCost);
									var quantity = sorec.getLineItemValue('item', 'quantity', b);
									var amt = parseFloat(quantity * uCost);
									sorec.setLineItemValue('item','custcol_totalamount',b,amt);
									sorec.setLineItemValue('item','amount',b,amt);
									//break;
								}
								if(isoverride != 'T' && unitCostisoverride == 'T' ) {
									nlapiLogExecution('DEBUG', 'isoverride != T', 'unitCostisoverride== T'+' b '+b);
									var uCost = sorec.getLineItemValue('item', 'custcol_spk_unitcost', b);
									if(!uCost) { uCost = 0; }
									nlapiLogExecution('DEBUG', 'uCost ', uCost);
									sorec.setLineItemValue('item', 'rate', b, uCost);
									var quantity = sorec.getLineItemValue('item', 'quantity', b);
									var amt = parseFloat(quantity * uCost);
									sorec.setLineItemValue('item','custcol_totalamount',b,amt);
									sorec.setLineItemValue('item','amount',b,amt);
									//break;
								}
								if(isoverride == 'T' && unitCostisoverride != 'T' ) {
									nlapiLogExecution('DEBUG', 'isoverride == T', 'unitCostisoverride!= T'+' b '+b);
									sorec.setLineItemValue('item','custcol_price',b,unitCost); // Price
									sorec.setLineItemValue('item','custcol_spk_unitcost',b,unitCost); // Unit Cost
									sorec.setLineItemValue('item', 'rate', b, unitCost); // Old Unit Cost
									var totamt = sorec.getLineItemValue('item', 'custcol_totalamount',b);
									if(!totamt) { totamt = 0; }
									nlapiLogExecution('DEBUG', 'totamt', totamt);
									sorec.setLineItemValue('item', 'amount', b, totamt);
									//break;
								}
							}
							// if any deleted lines or new lines on order exists without price, then simply override Total Amount to Old Total AMount
							// If any New lines or overriding the existing lines in SO to a new line,then overide the unit cost field with List rate value.
							else {
								nlapiLogExecution('DEBUG', 'else', 'b= '+b);
								var termInMonth = sorec.getLineItemValue('item', 'revrecterminmonths', b);
								var Listrate = sorec.getLineItemValue('item', 'custcol_list_rate', b); // Getting List rate Value
								var quantity = sorec.getLineItemValue('item', 'quantity', b);
								var isoverrideamt = sorec.getLineItemValue('item', 'custcol_overridetotalamount', b);
								var isuCost = sorec.getLineItemValue('item', 'custcol_spk_unitcost', b);
								if(!termInMonth) {
									isuCost = Listrate;
								}
								var isoverrideUcost = sorec.getLineItemValue('item', 'custcol_spk_overrideunitcost', b);
								nlapiLogExecution('DEBUG', 'else b '+b,' isoverrideamt '+isoverrideamt+ ' isoverrideUcost '+isoverrideUcost);
								
								if(isoverrideamt != 'T' && isoverrideUcost != 'T') {
									nlapiLogExecution('DEBUG', 'Else isoverrideamt != T', 'isoverrideUcost!= T'+' b '+b);
									sorec.setLineItemValue('item', 'rate', b, isuCost);
									var quantity = sorec.getLineItemValue('item', 'quantity', b);
									var amt = parseFloat(quantity * isuCost);
									sorec.setLineItemValue('item','custcol_totalamount',b,amt);
									sorec.setLineItemValue('item','amount',b,amt);
									//break;
								}
								if(isoverrideamt == 'T' && isoverrideUcost == 'T' ) {
									nlapiLogExecution('DEBUG', 'Else isoverrideamt == T', 'isoverrideUcost== T'+' b '+b);
									sorec.setLineItemValue('item', 'rate', b, isuCost);
									var quantity = sorec.getLineItemValue('item', 'quantity', b);
									var amt = parseFloat(quantity * isuCost);
									sorec.setLineItemValue('item','custcol_totalamount',b,amt);
									sorec.setLineItemValue('item','amount',b,amt);
									//break;
								}
								if(isoverrideamt != 'T' && isoverrideUcost == 'T' ) {
									nlapiLogExecution('DEBUG', 'Else isoverrideamt != T', 'isoverrideUcost== T'+' b '+b);
									sorec.setLineItemValue('item', 'rate', b, isuCost);
									var quantity = sorec.getLineItemValue('item', 'quantity', b);
									var amt = parseFloat(quantity * isuCost);
									sorec.setLineItemValue('item','custcol_totalamount',b,amt);
									sorec.setLineItemValue('item','amount',b,amt);
									//break;
								}
								if(isoverrideamt == 'T' && isoverrideUcost != 'T' ) {
									nlapiLogExecution('DEBUG', 'Else isoverrideamt == T', 'isoverrideUcost!= T'+' b '+b);
									var totamt1 = sorec.getLineItemValue('item', 'custcol_totalamount', b);
									if(!totamt1) { totamt1 = 0; }
									sorec.setLineItemValue('item', 'amount', b, totamt1);
									//break;
								}
							}
						}
					}
					//update SO Total AMount that matches to the actual quote amount for reference in ase of SO line amounts modified
					sorec.setFieldValue('custbody_totalamount', totalamt);
					var soid = nlapiSubmitRecord(sorec, true);
					nlapiLogExecution('DEBUG', 'soid Submitted', soid);
				}
			}
		}
    }
	catch(e)
	{
		nlapiLogExecution('ERROR', 'Error', 'Error - Reason : ' + e.toString());
	}

 }
 //Function is used in Client script on field change onoverride Unitcost or Override Amt checked to enable/disable Total Amt Field
 function amtFieldChange(type,name)
 {
	if(type == 'item') {
		//alert("My Unit Cost");
		if(name == 'custcol_spk_overrideunitcost') {
			var linenum = nlapiGetCurrentLineItemValue(type,'line');
			var isoverride = nlapiGetCurrentLineItemValue(type,name);
			if(isoverride == 'T'){
				nlapiSetLineItemDisabled(type,'custcol_spk_unitcost',false,linenum);
			}
			else{
				nlapiSetLineItemDisabled(type,'custcol_spk_unitcost',true,linenum);
			}
		}
		if(name == 'custcol_overridetotalamount'){
			var linenum = nlapiGetCurrentLineItemValue(type,'line');
			var isoverride = nlapiGetCurrentLineItemValue(type,name);
			if(isoverride == 'T'){
				nlapiSetLineItemDisabled(type,'custcol_totalamount',false,linenum);
			}
			else{
				nlapiSetLineItemDisabled(type,'custcol_totalamount',true,linenum);
			}
		}
		if(name == 'revrecterminmonths'){
			var rate = nlapiGetCurrentLineItemValue(type,'rate');
			if(!rate) {
				rate = 0;
			}
			//alert('rate '+rate);
			if(nlapiGetCurrentLineItemValue(type,'custcol_spk_overrideunitcost')!= 'T') {
				nlapiSetCurrentLineItemValue(type,'custcol_spk_unitcost',rate);
			}
		}
	}
}
 //Function is used in Client script on line Init to disable Total Amt & Unit Cost Field on SO lines
 function onlineinit()
 {
	var isoverrideuc = nlapiGetCurrentLineItemValue('item','custcol_spk_overrideunitcost');
		if(isoverrideuc == 'T'){
			nlapiDisableLineItemField('item','custcol_spk_unitcost',false);
		}
		else{
			nlapiDisableLineItemField('item','custcol_spk_unitcost',true);
		}
	var isoverride = nlapiGetCurrentLineItemValue('item','custcol_overridetotalamount');
		if(isoverride == 'T'){
			nlapiDisableLineItemField('item','custcol_totalamount',false);
		}
		else{
			nlapiDisableLineItemField('item','custcol_totalamount',true);
		}
	
 }
 
 
 